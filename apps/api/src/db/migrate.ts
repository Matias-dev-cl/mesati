import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import type { Pool } from 'pg';

export async function applyMigrations(pool: Pool) {
  const directory = new URL('../../migrations/', import.meta.url);
  const files = (await readdir(directory))
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query('BEGIN');
    // El bloqueo transaccional serializa dos arranques de migraciones simultáneos.
    await client.query('SELECT pg_advisory_xact_lock(73104921)');
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    for (const file of files) {
      const sql = await readFile(new URL(file, directory), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const previous = await client.query<{ checksum: string }>(
        'SELECT checksum FROM schema_migrations WHERE name = $1',
        [file],
      );
      if (previous.rows[0]) {
        if (previous.rows[0].checksum !== checksum) {
          throw new Error(
            `La migración ${file} cambió después de aplicarse. Crear una nueva migración.`,
          );
        }
        continue;
      }
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
        [file, checksum],
      );
      applied.push(file);
    }
    await client.query('COMMIT');
    return applied;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
