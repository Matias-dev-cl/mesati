import type { Pool } from 'pg';

export const DEMO_REQUESTER_EMAIL = 'solicitante@mesati.invalid';

export async function seedDemoUser(pool: Pool) {
  await pool.query(
    `INSERT INTO users (name, email, role) VALUES ($1, $2, 'solicitante')
     ON CONFLICT (email) DO NOTHING`,
    ['Solicitante demo', DEMO_REQUESTER_EMAIL],
  );
}
