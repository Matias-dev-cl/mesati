import { createApp } from './app.js';
import { readConfig } from './config.js';
import { createDatabasePool } from './db/pool.js';

const config = readConfig(process.env);
const pool = createDatabasePool(config.databaseUrl);
const app = createApp({
  checkDatabase: async () => {
    await pool.query('SELECT 1');
  },
});

const server = app.listen(config.port, '127.0.0.1', () => {
  console.info(`MesaTI API: http://127.0.0.1:${config.port}`);
});

server.on('error', () => {
  console.error('No se pudo iniciar la API. Revisar el puerto configurado.');
  void pool.end().finally(() => {
    process.exitCode = 1;
  });
});

function shutdown() {
  server.close(() => {
    void pool.end().catch(() => {
      process.exitCode = 1;
    });
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
