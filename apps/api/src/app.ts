import express from 'express';

type Dependencies = {
  checkDatabase: () => Promise<void>;
};

// Separar la aplicación del puerto permite probar HTTP sin iniciar el servidor real.
export function createApp({ checkDatabase }: Dependencies) {
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

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Ruta no encontrada.' },
    });
  });

  return app;
}
