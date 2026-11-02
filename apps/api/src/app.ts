import express, { type Router } from 'express';
import { handleError } from './http-error.js';

type Dependencies = {
  checkDatabase: () => Promise<void>;
  ticketRouter?: Router;
};

// Separar la aplicación del puerto permite probar HTTP sin iniciar el servidor real.
export function createApp({ checkDatabase, ticketRouter }: Dependencies) {
  const app = express();
  app.disable('x-powered-by');

  app.get('/api/v1/health', async (_request, response) => {
    response.set('Cache-Control', 'no-store');
    try {
      await checkDatabase();
      response.json({ data: { status: 'ok', database: 'up' } });
    } catch {
      // La respuesta pública no incluye mensajes del driver ni datos de conexión.
      response.status(503).json({
        data: { status: 'unavailable', database: 'down' },
      });
    }
  });

  if (ticketRouter) app.use('/api/v1/tickets', ticketRouter);

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Ruta no encontrada.' },
    });
  });

  app.use(handleError);
  return app;
}
