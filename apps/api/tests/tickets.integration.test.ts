import { randomUUID } from 'node:crypto';
import pg from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { applyMigrations } from '../src/db/migrate.js';
import { DEMO_REQUESTER_EMAIL, seedDemoUser } from '../src/db/seed.js';
import { createTicketRouter } from '../src/modules/tickets/routes.js';

const databaseName = `mesati_test_${randomUUID().replaceAll('-', '')}`;
let admin: pg.Pool;
let pool: pg.Pool;
let app: ReturnType<typeof createApp>;
let created = false;
const validTicket = {
  title: 'No puedo imprimir',
  description: 'La impresora no responde desde esta mañana.',
  category: 'hardware',
  priority: 'media',
};

beforeAll(async () => {
  if (!process.env.DATABASE_URL)
    throw new Error(
      'Falta DATABASE_URL para crear una base temporal de pruebas.',
    );
  const databaseUrl = new URL(process.env.DATABASE_URL);
  if (!['localhost', '127.0.0.1'].includes(databaseUrl.hostname))
    throw new Error('Las pruebas requieren PostgreSQL local.');
  admin = new pg.Pool({
    connectionString: databaseUrl.toString(),
    connectionTimeoutMillis: 2000,
  });
  // El nombre proviene exclusivamente de un UUID propio; nunca de entrada del usuario.
  await admin.query(`CREATE DATABASE "${databaseName}"`);
  created = true;
  databaseUrl.pathname = `/${databaseName}`;
  pool = new pg.Pool({ connectionString: databaseUrl.toString(), max: 4 });
  await applyMigrations(pool);
  await seedDemoUser(pool);
  app = createApp({
    checkDatabase: async () => {
      await pool.query('SELECT 1');
    },
    ticketRouter: createTicketRouter(pool),
  });
}, 20000);

beforeEach(async () => {
  // Solo esta base recién creada es descartable; nunca truncar la base de desarrollo.
  await pool.query('TRUNCATE ticket_events, tickets RESTART IDENTITY');
});

afterAll(async () => {
  if (pool) await pool.end();
  if (created && /^mesati_test_[a-f0-9]{32}$/.test(databaseName)) {
    await admin.query(`DROP DATABASE "${databaseName}"`);
  }
  if (admin) await admin.end();
});

describe('tickets con PostgreSQL real aislado', () => {
  it('repite migraciones y seed sin duplicar datos', async () => {
    expect(await applyMigrations(pool)).toEqual([]);
    await seedDemoUser(pool);
    const users = await pool.query('SELECT id FROM users WHERE email = $1', [
      DEMO_REQUESTER_EMAIL,
    ]);
    expect(users.rowCount).toBe(1);
  });

  it('devuelve lista vacía con total cero', async () => {
    const response = await request(app).get('/api/v1/tickets');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: [],
      pagination: { page: 1, pageSize: 20, total: 0 },
    });
  });

  it('crea un pendiente, recorta espacios y registra un evento con el mismo actor', async () => {
    const response = await request(app)
      .post('/api/v1/tickets')
      .send({ ...validTicket, title: '  No puedo imprimir  ' });
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      title: validTicket.title,
      status: 'pendiente',
    });
    expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
    const events = await pool.query(
      'SELECT actor_id, event_type, to_status FROM ticket_events WHERE ticket_id = $1',
      [response.body.data.id],
    );
    expect(events.rows).toEqual([
      {
        actor_id: response.body.data.requesterId,
        event_type: 'created',
        to_status: 'pendiente',
      },
    ]);
    const list = await request(app).get('/api/v1/tickets');
    expect(list.body.data[0]).toEqual(response.body.data);
  });

  it.each([
    { title: '    ' },
    { title: 'a'.repeat(121) },
    { description: 'corto' },
    { description: 'a'.repeat(5001) },
    { category: 'inventada' },
    { priority: 'urgente' },
    { title: 123 },
    { title: 'Nulo\0prohibido' },
    { requesterId: 99 },
    { status: 'resuelto' },
    { assetId: 1 },
  ])('rechaza datos inválidos o campos reservados: %j', async (override) => {
    const response = await request(app)
      .post('/api/v1/tickets')
      .send({ ...validTicket, ...override });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_INPUT');
    expect((await pool.query('SELECT id FROM tickets')).rowCount).toBe(0);
    expect((await pool.query('SELECT id FROM ticket_events')).rowCount).toBe(0);
  });

  it('permite límites exactos y trata SQL como texto', async () => {
    for (const input of [
      { ...validTicket, title: 'a'.repeat(5), description: 'a'.repeat(10) },
      { ...validTicket, title: 'a'.repeat(120), description: 'a'.repeat(5000) },
      { ...validTicket, title: "'; DROP TABLE tickets; --" },
    ])
      expect(
        (await request(app).post('/api/v1/tickets').send(input)).status,
      ).toBe(201);
    expect((await pool.query('SELECT id FROM tickets')).rowCount).toBe(3);
  });

  it('pagina con orden estable, total real y alcance del solicitante', async () => {
    for (let index = 0; index < 3; index++)
      await request(app).post('/api/v1/tickets').send(validTicket);
    await pool.query("UPDATE tickets SET created_at = '2026-01-01T00:00:00Z'");
    const other = await pool.query(
      "INSERT INTO users (name,email,role) VALUES ('Otro','otro@mesati.invalid','solicitante') RETURNING id",
    );
    await pool.query(
      "INSERT INTO tickets (title,description,category,priority,requester_id) VALUES ('Ticket ajeno','No debe verse en el listado demo','red','alta',$1)",
      [other.rows[0].id],
    );
    const first = await request(app).get('/api/v1/tickets?page=1&pageSize=2');
    const second = await request(app).get('/api/v1/tickets?page=2&pageSize=2');
    const beyond = await request(app).get('/api/v1/tickets?page=3&pageSize=2');
    expect(first.body.pagination.total).toBe(3);
    expect(first.body.data.map((ticket: { id: number }) => ticket.id)).toEqual([
      3, 2,
    ]);
    expect(second.body.data.map((ticket: { id: number }) => ticket.id)).toEqual(
      [1],
    );
    expect(beyond.body).toEqual({
      data: [],
      pagination: { page: 3, pageSize: 2, total: 3 },
    });
  });

  it.each([
    'page=0',
    'page=-1',
    'page=1.5',
    'page=1000001',
    'pageSize=101',
    'pageSize=x',
    'page=1&page=2',
    'requesterId=3',
  ])('rechaza paginación inválida: %s', async (query) => {
    expect((await request(app).get(`/api/v1/tickets?${query}`)).status).toBe(
      400,
    );
  });

  it('revierte el ticket cuando falla su evento', async () => {
    await pool.query(
      "ALTER TABLE ticket_events ADD CONSTRAINT simulate_failure CHECK (event_type <> 'created')",
    );
    try {
      const response = await request(app)
        .post('/api/v1/tickets')
        .send(validTicket);
      expect(response.status).toBe(500);
      expect(response.body.error.message).toBe(
        'No se pudo completar la operación.',
      );
      expect((await pool.query('SELECT id FROM tickets')).rowCount).toBe(0);
      expect((await pool.query('SELECT id FROM ticket_events')).rowCount).toBe(
        0,
      );
    } finally {
      await pool.query(
        'ALTER TABLE ticket_events DROP CONSTRAINT simulate_failure',
      );
    }
  });

  it('normaliza JSON inválido, formato incorrecto y cuerpo demasiado grande', async () => {
    const malformed = await request(app)
      .post('/api/v1/tickets')
      .set('Content-Type', 'application/json')
      .send('{');
    expect(malformed.status).toBe(400);
    expect(malformed.body.error.code).toBe('INVALID_JSON');
    expect(
      (await request(app).post('/api/v1/tickets').send('texto')).status,
    ).toBe(415);
    expect(
      (
        await request(app)
          .post('/api/v1/tickets')
          .send({ ...validTicket, description: 'a'.repeat(40000) })
      ).status,
    ).toBe(413);
  });
});
