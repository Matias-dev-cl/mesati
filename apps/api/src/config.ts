export function readConfig(environment: NodeJS.ProcessEnv) {
  const databaseUrl = environment.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Falta DATABASE_URL. Revisar el archivo .env.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL debe ser una URL de PostgreSQL válida.');
  }
  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('DATABASE_URL debe usar el protocolo de PostgreSQL.');
  }

  const port = Number(environment.API_PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT debe ser un entero entre 1 y 65535.');
  }

  return { databaseUrl, port };
}
