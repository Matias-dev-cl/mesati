import { useEffect, useState } from 'react';

type ConnectionState = 'loading' | 'ready' | 'unavailable';

function isHealthy(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || !('data' in value)) {
    return false;
  }
  const data = value.data;
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    'database' in data &&
    data.status === 'ok' &&
    data.database === 'up'
  );
}

const connectionLabels: Record<ConnectionState, string> = {
  loading: 'Comprobando conexión…',
  ready: 'Conexión disponible',
  unavailable: 'Conexión no disponible',
};

export function App() {
  const [connection, setConnection] = useState<ConnectionState>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function checkConnection() {
      try {
        const response = await fetch('/api/v1/health', {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(7000),
          ]),
        });
        const body: unknown = await response.json();
        if (!controller.signal.aborted) {
          setConnection(
            response.ok && isHealthy(body) ? 'ready' : 'unavailable',
          );
        }
      } catch {
        if (!controller.signal.aborted) setConnection('unavailable');
      }
    }
    void checkConnection();
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="shell">
      <header className="header">
        <a className="brand" href="/" aria-label="MesaTI, inicio">
          <span className="brand-icon" aria-hidden="true">
            M
          </span>
          Mesa<span className="brand-accent">TI</span>
        </a>
        <span className="stage">Proyecto en desarrollo</span>
      </header>
      <main>
        <section className="intro" aria-labelledby="welcome-title">
          <p className="eyebrow">SOPORTE CON SEGUIMIENTO</p>
          <h1 id="welcome-title">
            Cada solicitud,
            <br />
            un siguiente paso.
          </h1>
          <p className="lead">
            Un lugar para organizar la atención, registrar soluciones y conocer
            la historia de tus equipos.
          </p>
        </section>

        <section className="connection-card" aria-labelledby="connection-title">
          <div className="card-heading">
            <p className="eyebrow">PRIMERA ENTREGA</p>
            <span className="step-number">01 / 06</span>
          </div>
          <h2 id="connection-title">Una base para comenzar</h2>
          <p>Estamos preparando el entorno antes de incorporar los tickets.</p>
          <div
            className={`connection-status ${connection}`}
            role="status"
            aria-live="polite"
          >
            <span className="status-dot" aria-hidden="true" />
            {connectionLabels[connection]}
          </div>
          <p className="status-detail">
            {connection === 'ready'
              ? 'El servicio responde y la base de datos está disponible.'
              : connection === 'loading'
                ? 'Verificando la respuesta del servicio y la base de datos.'
                : 'No pudimos completar la comprobación. Verifica que la API y PostgreSQL estén iniciados.'}
          </p>
          <button
            type="button"
            disabled={connection === 'loading'}
            onClick={() => {
              setConnection('loading');
              setAttempt((current) => current + 1);
            }}
          >
            Volver a comprobar <span aria-hidden="true">↗</span>
          </button>
        </section>

        <section className="roadmap" aria-labelledby="next-title">
          <h2 id="next-title">Lo que construiremos</h2>
          <div className="feature-grid">
            <article>
              <span className="feature-index">01</span>
              <h3>Solicitudes claras</h3>
              <p>Registrar una falla y consultar su avance.</p>
            </article>
            <article>
              <span className="feature-index">02</span>
              <h3>Atención con historia</h3>
              <p>Asignar, diagnosticar y dejar una solución registrada.</p>
            </article>
            <article>
              <span className="feature-index">03</span>
              <h3>Equipos conectados</h3>
              <p>Relacionar cada solicitud con el equipo que la origina.</p>
            </article>
          </div>
        </section>
      </main>
      <footer>
        MesaTI · Portafolio de Matías Muñoz{' '}
        <span>Datos ficticios · Sin tickets todavía</span>
      </footer>
    </div>
  );
}
