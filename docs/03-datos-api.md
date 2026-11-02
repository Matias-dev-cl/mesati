# Modelo de datos y API propuesta

Contrato preliminar. Se concretarán los esquemas completos de petición/respuesta y errores antes de implementar cada entrega.

## Contrato implementado en la etapa 1

`GET /api/v1/health` ejecuta `SELECT 1` y no requiere sesión:

- 200: `{ "data": { "status": "ok", "database": "up" } }`.
- 503: `{ "data": { "status": "unavailable", "database": "down" } }`.
- Incluye `Cache-Control: no-store`; no devuelve detalles del error de PostgreSQL.
- El 503 describe disponibilidad, por lo que utiliza `data` en lugar del formato de error de las operaciones de negocio.

Una ruta inexistente responde 404 con `{ "error": { "code": "NOT_FOUND", "message": "Ruta no encontrada." } }`. POST y GET de tickets ya están implementados según [el contrato de la etapa 2](07-primer-ticket.md). Los demás endpoints siguen siendo propuestas.

## Entidades previstas para el MVP

La migración inicial crea users, tickets y ticket_events. Contraseñas, equipos, comentarios y sesiones se incorporarán en sus etapas; el modelo completo siguiente no implica que esas funciones ya existan.

| Tabla         | Campos principales                                                                                                                         | Restricciones                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| users         | id, name, email, password_hash, role, created_at                                                                                           | Email único; rol solicitante o técnico                             |
| assets        | id, inventory_code, name, type, assigned_user_id, active, created_at, updated_at                                                           | Código único; usuario opcional                                     |
| tickets       | id, title, description, category, priority, status, requester_id, technician_id, asset_id, resolution, created_at, updated_at, resolved_at | Solicitante obligatorio; técnico y equipo opcionales al crear      |
| comments      | id, ticket_id, author_id, body, created_at                                                                                                 | Ticket y autor obligatorios; sin edición en el MVP                 |
| ticket_events | id, ticket_id, actor_id, event_type, from_status, to_status, created_at                                                                    | Eventos de creación y transición, escritos por el servidor         |
| sessions      | Por concretar con la biblioteca seleccionada                                                                                               | Persistencia y expiración definidas en la entrega de autenticación |

Tipos previstos: identificadores enteros generados y fechas con zona horaria (`timestamptz`), almacenadas con referencia UTC y presentadas según configuración de la interfaz. Las claves foráneas conservan referencias; no se borran usuarios, equipos ni tickets mediante la API del MVP.

Coherencia de tickets mediante restricciones y lógica transaccional:

- `pendiente`: sin técnico, resolución ni fecha de resolución.
- `en_curso`: técnico obligatorio; sin resolución ni fecha de resolución.
- `resuelto`: técnico, resolución y fecha de resolución obligatorios.

El rol del técnico y el acceso al equipo se validan en la aplicación. Un cambio de prioridad o categoría posterior a la creación queda fuera del MVP.

## Endpoints previstos

| Método y ruta bajo `/api/v1` | Comportamiento                                                    |
| ---------------------------- | ----------------------------------------------------------------- |
| GET /health                  | Estado básico del servicio, sin secretos ni diagnósticos internos |
| POST /auth/login             | Validar credenciales y crear sesión                               |
| POST /auth/logout            | Invalidar sesión                                                  |
| GET /auth/me                 | Consultar usuario autenticado                                     |
| GET /tickets                 | Listado visible, paginado y filtrado                              |
| POST /tickets                | Crear ticket propio y evento inicial                              |
| GET /tickets/:id             | Detalle autorizado con comentarios e historial                    |
| POST /tickets/:id/take       | Tomar pendiente y registrar transición                            |
| POST /tickets/:id/resolve    | Resolver con diagnóstico y registrar transición                   |
| POST /tickets/:id/comments   | Añadir comentario a un ticket activo autorizado                   |
| GET /assets                  | Inventario visible y paginado                                     |
| POST /assets                 | Crear equipo, solo técnicos                                       |
| PATCH /assets/:id            | Editar equipo o desactivarlo, solo técnicos                       |
| GET /dashboard               | Conteos por estado dentro del alcance del usuario                 |

La primera entrega de tickets, previa al login, será exclusivamente local: usará un usuario ficticio definido por el servidor. No aceptará identidades arbitrarias del navegador ni se desplegará con ese acceso temporal.

## Convenciones

- JSON con propiedades `camelCase`; SQL con `snake_case`.
- Listas: `{ data: [], pagination: { page, pageSize, total } }`; página inicial 1, tamaño predeterminado 20 y máximo 100.
- Tickets: filtros `status`, `category`, `priority`; búsqueda `q` por título o identificador exacto si es numérica. Orden estable por `created_at DESC, id DESC`.
- Inventario: `q` por código o nombre y filtro `active`; el rol limita los resultados antes de paginar.
- Éxito: 200 lectura/actualización, 201 creación, 204 cierre de sesión.
- Errores: 400 entrada inválida, 401 sin sesión, 403 acción no permitida por rol, 404 recurso inexistente o fuera del alcance, 409 conflicto de estado o código duplicado.
- Formato de error: `{ error: { code, message, fields? } }`. Mensajes útiles sin información sensible.
- Indicadores: `{ data: { pending, inProgress, resolved } }`, contando en base de datos según usuario; no derivarlos de una página del listado.

## Casos que deben probarse

Lectura de ticket ajeno; equipo ajeno al crear; campos manipulados; toma simultánea; resolución por otro técnico; transición inválida; diagnóstico vacío; comentario en ticket resuelto; rollback sin evento parcial; código de equipo duplicado; filtros y conteos que respeten permisos; cierre y expiración de sesión.
