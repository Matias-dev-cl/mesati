# Arquitectura y registro de decisiones

Estado: etapas 1 y 2 implementadas localmente. Existen interfaz, API de creación/listado, migraciones y PostgreSQL real verificado. Autenticación, atención e inventario siguen pendientes.

## Flujo

```text
Persona → React → HTTP /api/v1 → Express → PostgreSQL
                                    ↓
                         validación y permisos
                         reglas y transacciones
```

La interfaz muestra datos y ayuda a completar formularios. El servidor decide si una operación es válida. PostgreSQL conserva datos y restricciones, incluso cuando hay solicitudes simultáneas.

## Estructura prevista

```text
apps/web/             interfaz React
apps/api/             servidor Express
  src/modules/       auth, tickets, assets, dashboard
  src/db/            conexión y acceso a datos
  migrations/        cambios SQL versionados
docs/                producto, arquitectura y evidencias
```

Dentro de un módulo, separar rutas/controladores HTTP, reglas de negocio y consultas cuando exista una responsabilidad real. Evitar interfaces, capas y utilidades genéricas sin uso concreto. Las dependencias compartidas se extraen cuando haya repetición comprobada.

## Decisiones iniciales

| ID   | Decisión y motivo                                                                         | Coste o alternativa                                                                             |
| ---- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| D-01 | TypeScript en interfaz y servidor para practicar un mismo lenguaje y contratos explícitos | Django aprovecharía experiencia previa, pero aquí se prioriza aprender Node.js                  |
| D-02 | Un repositorio con dos aplicaciones, un servidor y una base                               | No se necesitan microservicios para este alcance                                                |
| D-03 | PostgreSQL y consultas SQL parametrizadas con `pg` para comprender SQL                    | Un ORM se reconsiderará solo si aparece una necesidad; las migraciones requieren disciplina     |
| D-04 | API REST con prefijo `/api/v1`                                                            | Los contratos se documentan antes de implementar cada recurso                                   |
| D-05 | Sesiones de servidor con cookie, buscando un mismo origen público para interfaz y API     | Requiere gestionar expiración y protección frente a CSRF; evita añadir renovación de JWT al MVP |
| D-06 | Sin MongoDB en el MVP                                                                     | La práctica no relacional queda pendiente y no se presentará como implementada                  |

Si una decisión cambia, actualizar motivo, consecuencias y tareas afectadas en el mismo commit. Elegir versiones soportadas y verificar documentación oficial al instalar dependencias.

## Seguridad prevista

- Usar una biblioteca mantenida para contraseñas y sesiones; concretar biblioteca, parámetros, expiración y almacenamiento antes de implementar autenticación, consultando sus fuentes oficiales.
- Cookie de sesión `HttpOnly`, `Secure` en producción y política `SameSite` definida; cierre de sesión invalida la sesión de servidor.
- Diseñar protección CSRF para operaciones que modifican datos y comprobar el origen; `SameSite` no sustituye la revisión del flujo.
- Comprobar rol y acceso al recurso en el servidor. Consultas siempre parametrizadas.
- Validar entradas, limitar tamaño de cuerpos, paginación y frecuencia de acceso al login.
- No registrar contraseñas, cookies ni tokens. No exponer trazas internas en respuestas.
- Secretos solo por variables de entorno; ejemplos con valores ficticios. Sin datos personales reales en la demo.

Estas medidas son tareas pendientes, no garantías de seguridad de una aplicación existente.

## Rendimiento y fiabilidad

Las listas se paginan. Las transiciones y sus eventos se guardan en la misma transacción. Para tomar un ticket se actualizará condicionalmente por estado y asignación, comprobando filas afectadas; no basta con leer y después escribir sin protección.

Los índices se justifican con consultas reales y datos sintéticos. La evidencia incluirá consulta, volumen, entorno y resultado de `EXPLAIN ANALYZE` antes/después, sin prometer mejoras antes de medirlas.

## Decisión de la etapa 2

El primer recorrido habilita un solicitante ficticio únicamente mediante LOCAL_DEMO_ENABLED. Usuarios todavía no tienen contraseña: la migración de autenticación incorporará ese dato en la etapa 3. El inventario y los comentarios no se crean anticipadamente. El backend concentra la identidad temporal en el módulo de tickets para retirarla al añadir sesiones. Consultar [el contrato implementado](07-primer-ticket.md).
