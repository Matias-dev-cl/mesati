import express, { Router } from 'express';
import type { Pool } from 'pg';
import { HttpError } from '../../http-error.js';
import { createTicket, listTickets } from './repository.js';
import { validatePagination, validateTicket } from './validation.js';

export function createTicketRouter(pool: Pool) {
  const router = Router();
  router.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
  });
  router.get('/', async (request, response) => {
    response.json(await listTickets(pool, validatePagination(request.query)));
  });
  router.post(
    '/',
    (request, _response, next) => {
      if (!request.is('application/json')) {
        throw new HttpError(
          415,
          'UNSUPPORTED_MEDIA_TYPE',
          'Envía la solicitud como application/json.',
        );
      }
      next();
    },
    express.json({ limit: '32kb' }),
    async (request, response) => {
      const input = validateTicket(request.body);
      response.status(201).json({ data: await createTicket(pool, input) });
    },
  );
  return router;
}
