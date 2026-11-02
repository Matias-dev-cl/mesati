import { useEffect, useState } from 'react';
import {
  ApiError,
  categoryLabels,
  fetchTickets,
  priorityLabels,
  statusLabels,
  type Ticket,
  type TicketPage,
} from './api';
import { TicketForm } from './TicketForm';
import './tickets.css';

type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; result: TicketPage };
const dateFormat = new Intl.DateTimeFormat('es-CL', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function TicketWorkspace() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [revision, setRevision] = useState(0);
  const [list, setList] = useState<ListState>({ status: 'loading' });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchTickets(page, pageSize, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setList({ status: 'ready', result });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setList({
            status: 'error',
            message:
              error instanceof ApiError
                ? error.message
                : 'No pudimos cargar las solicitudes. Intenta actualizar el listado.',
          });
      });
    return () => controller.abort();
  }, [page, pageSize, revision]);

  function refresh() {
    setList({ status: 'loading' });
    setRevision((current) => current + 1);
  }
  function changePage(next: number) {
    setList({ status: 'loading' });
    setPage(next);
  }
  function created(ticket: Ticket) {
    setNotice(
      `Solicitud #${ticket.id} creada correctamente. Quedó guardada como pendiente.`,
    );
    setPage(1);
    refresh();
  }

  return (
    <section className="ticket-workspace" aria-label="Gestión de solicitudes">
      <div className="section-heading">
        <div>
          <p className="eyebrow">MESA DE AYUDA</p>
          <h2>Tus solicitudes, en un solo lugar</h2>
        </div>
        <span className="demo-label">Demo local · Sin inicio de sesión</span>
      </div>
      {notice && (
        <div role="status" className="success-notice">
          <span aria-hidden="true">✓</span>
          {notice}
        </div>
      )}
      <div className="ticket-layout">
        <TicketForm onCreated={created} />
        <section
          className="ticket-list-card"
          aria-labelledby="tickets-list-title"
        >
          <div className="list-heading">
            <div>
              <h2 id="tickets-list-title">Mis solicitudes</h2>
              <p className="panel-description">
                Las más recientes aparecen primero.
              </p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={refresh}
              disabled={list.status === 'loading'}
            >
              Actualizar
            </button>
          </div>
          <div className="list-content" aria-busy={list.status === 'loading'}>
            {list.status === 'loading' && (
              <div className="list-placeholder" role="status">
                <div className="placeholder-icon" aria-hidden="true">
                  ···
                </div>
                <h3>Cargando solicitudes</h3>
                <p>Consultando los registros guardados.</p>
              </div>
            )}
            {list.status === 'error' && (
              <div className="list-placeholder" role="alert">
                <div className="placeholder-icon" aria-hidden="true">
                  !
                </div>
                <h3>No pudimos cargar el listado</h3>
                <p>{list.message}</p>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={refresh}
                >
                  Reintentar carga
                </button>
              </div>
            )}
            {list.status === 'ready' && list.result.data.length === 0 && (
              <div className="list-placeholder">
                <div className="placeholder-icon" aria-hidden="true">
                  ↗
                </div>
                <h3>
                  {list.result.pagination.total === 0
                    ? 'Tu primera solicitud comienza aquí'
                    : 'No hay solicitudes en esta página'}
                </h3>
                <p>
                  {list.result.pagination.total === 0
                    ? 'Completa el formulario y tu solicitud aparecerá en este espacio.'
                    : 'Vuelve a la página anterior para ver tus registros.'}
                </p>
              </div>
            )}
            {list.status === 'ready' && list.result.data.length > 0 && (
              <ul className="ticket-list">
                {list.result.data.map((ticket) => (
                  <li key={ticket.id}>
                    <div className="ticket-meta">
                      <span className="ticket-id">
                        #{String(ticket.id).padStart(4, '0')}
                      </span>
                      <span className={`ticket-status ${ticket.status}`}>
                        <span aria-hidden="true">●</span>{' '}
                        {statusLabels[ticket.status]}
                      </span>
                    </div>
                    <details>
                      <summary>{ticket.title}</summary>
                      <p className="ticket-description">{ticket.description}</p>
                    </details>
                    <div className="ticket-bottom">
                      <span>{categoryLabels[ticket.category]}</span>
                      <span className={`priority ${ticket.priority}`}>
                        Prioridad{' '}
                        {priorityLabels[ticket.priority]?.toLowerCase()}
                      </span>
                      <time dateTime={ticket.createdAt}>
                        {dateFormat.format(new Date(ticket.createdAt))}
                      </time>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="list-footer">
            <label className="page-size">
              Por página
              <select
                aria-label="Solicitudes por página"
                value={pageSize}
                disabled={list.status === 'loading'}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                  setList({ status: 'loading' });
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            {list.status === 'ready' && (
              <>
                <span className="page-summary">
                  {list.result.pagination.total} en total · Página {page} de{' '}
                  {Math.max(
                    1,
                    Math.ceil(list.result.pagination.total / pageSize),
                  )}
                </span>
                <nav aria-label="Paginación de solicitudes">
                  <button
                    type="button"
                    className="pagination-button"
                    aria-label="Página anterior"
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="pagination-button"
                    aria-label="Página siguiente"
                    disabled={page * pageSize >= list.result.pagination.total}
                    onClick={() => changePage(page + 1)}
                  >
                    →
                  </button>
                </nav>
              </>
            )}
          </div>
        </section>
      </div>
      <p className="next-delivery">
        Próximas entregas: acceso con roles, atención de solicitudes e
        inventario de equipos.
      </p>
    </section>
  );
}
