import { describe, expect, it } from 'vitest';
import { readConfig } from '../src/config.js';

const databaseUrl = 'postgresql://demo:demo@localhost:5434/mesati';

describe('configuración de inicio', () => {
  it('deshabilita la demo por defecto y la prohíbe en producción', () => {
    expect(readConfig({ DATABASE_URL: databaseUrl }).localDemoEnabled).toBe(
      false,
    );
    expect(
      readConfig({ DATABASE_URL: databaseUrl, LOCAL_DEMO_ENABLED: 'true' })
        .localDemoEnabled,
    ).toBe(true);
    expect(() =>
      readConfig({
        DATABASE_URL: databaseUrl,
        LOCAL_DEMO_ENABLED: 'true',
        NODE_ENV: 'production',
      }),
    ).toThrow('producción');
  });
  it('exige la conexión a la base y no expone su valor en errores', () => {
    expect(() => readConfig({})).toThrow('Falta DATABASE_URL');
    expect(() => readConfig({ DATABASE_URL: 'secreto-inválido' })).toThrow(
      'DATABASE_URL debe ser una URL de PostgreSQL válida.',
    );
    expect(() => readConfig({ DATABASE_URL: 'https://example.com' })).toThrow(
      'DATABASE_URL debe usar el protocolo de PostgreSQL.',
    );
  });

  it.each(['0', '65536', 'abc', '3.5', ''])('rechaza el puerto %j', (port) => {
    expect(() =>
      readConfig({ DATABASE_URL: databaseUrl, API_PORT: port }),
    ).toThrow('API_PORT');
  });

  it('utiliza el puerto local predeterminado o el valor configurado', () => {
    expect(readConfig({ DATABASE_URL: databaseUrl }).port).toBe(3001);
    expect(
      readConfig({ DATABASE_URL: databaseUrl, API_PORT: '3010' }).port,
    ).toBe(3010);
  });
});
