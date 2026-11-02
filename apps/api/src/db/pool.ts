import pg from 'pg';

export function createDatabasePool(connectionString: string) {
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 2000,
    query_timeout: 2000,
    statement_timeout: 2000,
    idleTimeoutMillis: 10000,
  });

  // Una desconexión de un cliente inactivo no debe terminar el proceso de Node.
  pool.on('error', () => {
    console.error('Se perdió una conexión inactiva con PostgreSQL.');
  });

  return pool;
}
