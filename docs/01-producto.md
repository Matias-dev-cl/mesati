# Producto y alcance

## Problema

Una empresa ficticia recibe solicitudes de soporte dispersas y no puede consultar fácilmente quién atiende una falla ni qué se hizo con un equipo. MesaTI centraliza ese recorrido.

## Usuarios y permisos

| Acción | Solicitante | Técnico |
| --- | --- | --- |
| Crear ticket | Sí, a su nombre | Sí, a su nombre |
| Leer tickets, comentarios e historial | Solo propios | Todos |
| Comentar | En sus tickets activos | En cualquier ticket activo |
| Tomar ticket pendiente | No | Sí, se lo asigna a sí mismo |
| Resolver ticket | No | Solo el técnico asignado |
| Consultar inventario | Solo equipos activos asignados a él | Todos |
| Crear o editar equipos | No | Sí |
| Ver indicadores | De sus tickets | De todos |

Los permisos se verifican en el servidor en cada solicitud. Ocultar un botón no constituye autorización. En el MVP no habrá registro público ni gestión de usuarios: las cuentas se cargarán mediante datos demo locales.

## Alcance del MVP

- Inicio y cierre de sesión con roles solicitante y técnico.
- Tickets con título, descripción, categoría y prioridad.
- Estados, asignación propia del técnico, diagnóstico de resolución e historial.
- Comentarios visibles para quien tenga acceso al ticket; no hay notas privadas.
- Inventario con código único, nombre, tipo y usuario asignado opcional.
- Asociación opcional de un equipo al crear un ticket.
- Listado paginado con búsqueda por título e identificador; filtros por estado, categoría y prioridad.
- Indicadores de pendientes, en curso y resueltos dentro del alcance visible para cada usuario.

## Reglas de negocio

1. Un ticket nace `pendiente`, sin técnico asignado. Su solicitante se obtiene de la sesión.
2. Categorías iniciales: `hardware`, `software`, `red`, `accesos`, `otro`. Prioridades: `baja`, `media`, `alta`. Todos los usuarios pueden seleccionar prioridad; no determina un plazo garantizado.
3. Un técnico toma un ticket pendiente: en una sola transacción se asigna a sí mismo y cambia el estado a `en_curso`.
4. Solo el técnico asignado puede pasar de `en_curso` a `resuelto`. Debe proporcionar un diagnóstico no vacío.
5. No se permite saltar estados, reabrir, reasignar ni borrar tickets en el MVP. Una falla posterior se registra como un ticket nuevo.
6. Los tickets resueltos son de solo lectura, incluidos sus comentarios. El historial no se puede editar desde la API.
7. Cada creación y transición registra actor y fecha. Una operación fallida no deja eventos ni cambios parciales.
8. El solicitante solo puede vincular un equipo activo asignado a él. El técnico puede vincular cualquier equipo activo al crear su propio ticket.
9. El equipo se elige al crear el ticket y no se cambia en el MVP. Cambiar posteriormente la asignación del equipo no altera el solicitante ni el acceso al ticket histórico.
10. Los equipos se desactivan en lugar de borrarse. Sus vínculos históricos se conservan.
11. El servidor determina actores, fechas, estados y asignaciones; no confía en esos campos enviados por el cliente.
12. Los indicadores representan todos los tickets visibles para el rol y no cambian con los filtros de la tabla. La interfaz lo indica expresamente.

## Historias prioritarias y aceptación

### HU-01 — Informar una falla

Como solicitante quiero registrar una falla para que soporte pueda atenderla.

- Con sesión válida, título de 5 a 120 caracteres, descripción de 10 a 5.000, categoría y prioridad válidas, se crea un ticket pendiente.
- Los límites se aplican después de quitar espacios al inicio y al final.
- Si se vincula un equipo ajeno o inactivo, se rechaza la operación sin crear ticket.
- El ticket aparece en mi listado y contiene el evento de creación.

### HU-02 — Atender y resolver

Como técnico quiero tomar una solicitud y registrar la solución.

- Al tomar un pendiente, quedan guardados el técnico, el estado y el evento.
- Si dos técnicos intentan tomarlo, solo uno lo consigue; el otro recibe un conflicto.
- Resolver exige ser el técnico asignado y enviar un diagnóstico de 10 a 5.000 caracteres.
- Tras resolver se registra la fecha, se muestra el diagnóstico y cambian los indicadores.

### HU-03 — Consultar el seguimiento

Como solicitante quiero consultar mis solicitudes y entender su avance.

- Puedo ver mis tickets, comentarios e historial ordenado por fecha e identificador.
- No puedo leer ni modificar un ticket ajeno aunque conozca su identificador.
- Los comentarios activos admiten de 1 a 2.000 caracteres después de recortar espacios.

### HU-04 — Identificar equipos

Como técnico quiero mantener un inventario pequeño y vincular fallas a equipos.

- El código de inventario es único; un duplicado produce un error entendible.
- Un equipo desactivado deja de ser seleccionable y mantiene sus tickets anteriores.

## Límites explícitos

Una sola organización, dos roles y datos ficticios. Fuera del MVP: adjuntos, notificaciones, plazos de atención, chat, registro público, administración de roles, bases no relacionales, múltiples empresas y aplicaciones móviles nativas.

Una API externa o una práctica con MongoDB se evaluará después de completar y comprender el MVP. No se añade una tecnología solo para enumerarla en el portafolio.

## Experiencia mínima

Pantallas: acceso, listado/resumen, creación, detalle de ticket e inventario. Cada pantalla de datos contempla carga, vacío, error y éxito. Formularios con etiquetas, errores asociados al campo y navegación por teclado; diseño utilizable en móvil y escritorio.
