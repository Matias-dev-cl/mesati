import { useEffect, useState } from 'react';
import { TicketWorkspace } from './tickets/TicketWorkspace';

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
        <span className="stage">Demo local</span>
      </header>
      <div className="workspace-bar">
        <span>
          ESPACIO DE TRABAJO <b>/</b> Solicitudes
        </span>
        <span className="avatar" title="Solicitante demo">
          SD
        </span>
      </div>
      <main className="tickets-home">
        <section className="intro" aria-labelledby="welcome-title">
          <p className="eyebrow">TU CENTRO DE OPERACIONES TI</p>
          <h1 id="welcome-title">
            El soporte fluye.
            <br />
            Tu equipo avanza.
          </h1>
          <p className="lead">
            Un lugar para organizar la atención, registrar soluciones y conocer
            la historia de tus equipos.
          </p>
        </section>

        <section className="connection-card" aria-labelledby="connection-title">
          <div className="card-heading">
            <p className="eyebrow">ESTADO DEL ENTORNO</p>
            <span className="step-number">02 / 06</span>
          </div>
          <h2 id="connection-title">Todo comienza conectado</h2>
          <p>Crea una solicitud y consulta sus datos guardados.</p>
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

        <TicketWorkspace />
      </main>
      <footer>
        MesaTI · Portafolio de Matías Muñoz{' '}
        <span>Datos ficticios · Solicitante demo</span>
      </footer>
    </div>
  );
}
