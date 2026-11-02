import type { Pool, PoolClient } from 'pg';
import { DEMO_REQUESTER_EMAIL } from '../../db/seed.js';
import { HttpError } from '../../http-error.js';
import type { NewTicket, Pagination } from './validation.js';

type Ticket = NewTicket & {
  id: number;
  status: string;
  requesterId: number;
  createdAt: Date;
  updatedAt: Date;
};

const columns = `id, title, description, category, priority, status,
  requester_id AS "requesterId", created_at AS "createdAt", updated_at AS "updatedAt"`;

async function demoRequester(client: PoolClient) {
  const result = await client.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1 AND role = 'solicitante'",
    [DEMO_REQUESTER_EMAIL],
  );
  if (!result.rows[0])
    throw new HttpError(
      503,
      'DEMO_NOT_READY',
      'Falta preparar el solicitante demo.',
    );
  return result.rows[0].id;
}

export async function createTicket(pool: Pool, input: NewTicket) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const requesterId = await demoRequester(client);
    const result = await client.query<Ticket>(
      `INSERT INTO tickets (title, description, category, priority, requester_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING ${columns}`,
      [
        input.title,
        input.description,
        input.category,
        input.priority,
        requesterId,
      ],
    );
    const ticket = result.rows[0]!;
    await client.query(
      `INSERT INTO ticket_events (ticket_id, actor_id, event_type, to_status)
       VALUES ($1, $2, 'created', 'pendiente')`,
      [ticket.id, requesterId],
    );
    await client.query('COMMIT');
    return ticket;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listTickets(pool: Pool, pagination: Pagination) {
  const client = await pool.connect();
  try {
    // El total y la página deben ver la misma versión de los datos.
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const requesterId = await demoRequester(client);
    const count = await client.query<{ total: number }>(
      'SELECT count(*)::integer AS total FROM tickets WHERE requester_id = $1',
      [requesterId],
    );
    const result = await client.query<Ticket>(
      `SELECT ${columns} FROM tickets WHERE requester_id = $1
       ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
      [
        requesterId,
        pagination.pageSize,
        (pagination.page - 1) * pagination.pageSize,
      ],
    );
    await client.query('COMMIT');
    return {
      data: result.rows,
      pagination: { ...pagination, total: count.rows[0]!.total },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
