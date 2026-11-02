import { readConfig } from '../config.js';
import { applyMigrations } from '../db/migrate.js';
import { createDatabasePool } from '../db/pool.js';
import { seedDemoUser } from '../db/seed.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'La preparación demo solo está disponible para desarrollo local.',
  );
}
const pool = createDatabasePool(readConfig(process.env).databaseUrl);
try {
  const applied = await applyMigrations(pool);
  await seedDemoUser(pool);
  console.info(
    `Migraciones aplicadas: ${applied.length}. Solicitante demo preparado.`,
  );
} finally {
  await pool.end();
}
