export const categoryLabels: Record<string, string> = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red y conectividad',
  accesos: 'Accesos',
  otro: 'Otro',
};
export const priorityLabels: Record<string, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};
export const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  resuelto: 'Resuelto',
};
export type TicketDraft = {
  title: string;
  description: string;
  category: string;
  priority: string;
};
export type Ticket = TicketDraft & {
  id: number;
  requesterId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};
export type TicketPage = {
  data: Ticket[];
  pagination: { page: number; pageSize: number; total: number };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isTicket(value: unknown): value is Ticket {
  return (
    isObject(value) &&
    Number.isInteger(value.id) &&
    Number.isInteger(value.requesterId) &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.category === 'string' &&
    Object.hasOwn(categoryLabels, value.category) &&
    typeof value.priority === 'string' &&
    Object.hasOwn(priorityLabels, value.priority) &&
    typeof value.status === 'string' &&
    Object.hasOwn(statusLabels, value.status) &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    typeof value.updatedAt === 'string' &&
    Number.isFinite(Date.parse(value.updatedAt))
  );
}

async function readResponse(response: Response): Promise<unknown> {
  const body: unknown = await response.json();
  if (!response.ok) {
    const error = isObject(body) && isObject(body.error) ? body.error : {};
    const fields: Record<string, string> = {};
    if (isObject(error.fields)) {
      for (const [name, message] of Object.entries(error.fields)) {
        if (typeof message === 'string') fields[name] = message;
      }
    }
    throw new ApiError(
      typeof error.message === 'string'
        ? error.message
        : 'No se pudo completar la solicitud.',
      fields,
    );
  }
  return body;
}

export async function fetchTickets(
  page: number,
  pageSize: number,
  signal: AbortSignal,
): Promise<TicketPage> {
  const response = await fetch(
    `/api/v1/tickets?page=${page}&pageSize=${pageSize}`,
    {
      signal: AbortSignal.any([signal, AbortSignal.timeout(7000)]),
    },
  );
  const body = await readResponse(response);
  if (
    !isObject(body) ||
    !Array.isArray(body.data) ||
    !body.data.every(isTicket) ||
    !isObject(body.pagination) ||
    body.pagination.page !== page ||
    body.pagination.pageSize !== pageSize ||
    typeof body.pagination.total !== 'number' ||
    !Number.isSafeInteger(body.pagination.total) ||
    body.pagination.total < 0
  ) {
    throw new ApiError(
      'El servicio devolvió un listado que no pudimos interpretar.',
    );
  }
  return {
    data: body.data,
    pagination: { page, pageSize, total: body.pagination.total },
  };
}

export async function submitTicket(input: TicketDraft): Promise<Ticket> {
  const response = await fetch('/api/v1/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(7000),
  });
  const body = await readResponse(response);
  if (!isObject(body) || !isTicket(body.data))
    throw new Error('Respuesta de creación inesperada.');
  return body.data;
}
