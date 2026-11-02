import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export const handleError: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  if (error instanceof HttpError) {
    response
      .status(error.status)
      .json({
        error: {
          code: error.code,
          message: error.message,
          fields: error.fields,
        },
      });
    return;
  }
  const metadata = typeof error === 'object' && error !== null ? error : {};
  const type = 'type' in metadata ? metadata.type : undefined;
  if (type === 'entity.parse.failed' || type === 'entity.too.large') {
    response.status(type === 'entity.too.large' ? 413 : 400).json({
      error: {
        code: type === 'entity.too.large' ? 'BODY_TOO_LARGE' : 'INVALID_JSON',
        message:
          type === 'entity.too.large'
            ? 'La solicitud supera el tamaño permitido.'
            : 'El cuerpo debe contener JSON válido.',
      },
    });
    return;
  }
  const code = 'code' in metadata ? metadata.code : undefined;
  const unavailable =
    typeof code === 'string' &&
    ([
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      '57P01',
      '57P02',
      '57P03',
      '53300',
    ].includes(code) ||
      code.startsWith('08'));
  response.status(unavailable ? 503 : 500).json({
    error: {
      code: unavailable ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR',
      message: unavailable
        ? 'El servicio no está disponible. Intenta nuevamente.'
        : 'No se pudo completar la operación.',
    },
  });
};
