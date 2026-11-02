import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('responde 200 cuando la consulta de base de datos funciona', async () => {
    const app = createApp({ checkDatabase: async () => {} });
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: 'ok', database: 'up' } });
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('responde 503 sin filtrar detalles de conexión cuando la base falla', async () => {
    const app = createApp({
      checkDatabase: async () => {
        throw new Error('postgresql://usuario:secreto@servidor/base');
      },
    });
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      data: { status: 'unavailable', database: 'down' },
    });
    expect(response.text).not.toContain('secreto');
  });

  it('responde 404 en JSON para rutas desconocidas', async () => {
    const app = createApp({ checkDatabase: async () => {} });
    const response = await request(app).get('/api/v1/no-existe');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Ruta no encontrada.' },
    });
  });
});
