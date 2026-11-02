import { HttpError } from '../../http-error.js';

export const categories = [
  'hardware',
  'software',
  'red',
  'accesos',
  'otro',
] as const;
export const priorities = ['baja', 'media', 'alta'] as const;
export type NewTicket = {
  title: string;
  description: string;
  category: string;
  priority: string;
};
export type Pagination = { page: number; pageSize: number };

export function validateTicket(body: unknown): NewTicket {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(
      400,
      'INVALID_INPUT',
      'Envía los datos del ticket como un objeto JSON.',
    );
  }
  const input = body as Record<string, unknown>;
  const fields: Record<string, string> = {};
  if (
    Object.keys(input).some(
      (key) => !['title', 'description', 'category', 'priority'].includes(key),
    )
  ) {
    fields.form =
      'Solo se permiten título, descripción, categoría y prioridad.';
  }
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  const description =
    typeof input.description === 'string' ? input.description.trim() : '';
  // PostgreSQL cuenta caracteres Unicode; no unidades UTF-16 de JavaScript.
  if (
    [...title].length < 5 ||
    [...title].length > 120 ||
    title.includes('\0')
  ) {
    fields.title = 'Escribe un título de 5 a 120 caracteres.';
  }
  if (
    [...description].length < 10 ||
    [...description].length > 5000 ||
    description.includes('\0')
  ) {
    fields.description = 'Describe el problema con 10 a 5.000 caracteres.';
  }
  const category = typeof input.category === 'string' ? input.category : '';
  const priority = typeof input.priority === 'string' ? input.priority : '';
  if (!categories.some((value) => value === category))
    fields.category = 'Selecciona una categoría válida.';
  if (!priorities.some((value) => value === priority))
    fields.priority = 'Selecciona una prioridad válida.';
  if (Object.keys(fields).length) {
    throw new HttpError(
      400,
      'INVALID_INPUT',
      'Revisa los campos del formulario.',
      fields,
    );
  }
  return { title, description, category, priority };
}

export function validatePagination(query: Record<string, unknown>): Pagination {
  if (Object.keys(query).some((key) => !['page', 'pageSize'].includes(key))) {
    throw new HttpError(
      400,
      'INVALID_QUERY',
      'Esta entrega admite solo page y pageSize.',
    );
  }
  function integer(value: unknown, fallback: number, maximum: number) {
    if (value === undefined) return fallback;
    if (
      typeof value !== 'string' ||
      !/^[1-9]\d*$/.test(value) ||
      Number(value) > maximum
    ) {
      throw new HttpError(
        400,
        'INVALID_QUERY',
        'La página o el tamaño de página no son válidos.',
      );
    }
    return Number(value);
  }
  return {
    page: integer(query.page, 1, 1_000_000),
    pageSize: integer(query.pageSize, 20, 100),
  };
}
