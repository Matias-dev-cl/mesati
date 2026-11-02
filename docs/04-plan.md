# Plan de entregas

Sin fechas estimadas todavía: el ritmo dependerá de que cada entrega funcione y se comprenda. Todas están pendientes salvo la base documental.

| Etapa | Entregable | Verificación de salida | Concepto que Maty debe poder explicar |
| --- | --- | --- | --- |
| 0 — Base documental | Alcance, reglas, diseño y guía de trabajo | Documentos coherentes, sin prometer funciones existentes | Qué problema resuelve y qué queda fuera |
| 1 — Entorno mínimo | React, API con health, PostgreSQL y configuración de ejemplo | Inicio local reproducible desde instrucciones; conexión a la base comprobada | Qué ejecuta cada proceso y cómo se comunican |
| 2 — Primer recorrido local | Migraciones, datos ficticios, crear y listar tickets desde React | Se conserva un ticket tras reiniciar; validaciones y paginación comprobadas | Petición, validación, SQL y respuesta |
| 3 — Acceso y permisos | Sesiones, login/logout, roles y consultas limitadas | Pruebas de acceso ajeno, sesión inválida y logout; retirar usuario temporal de etapa 2 | Autenticación, autorización y cookie |
| 4 — Atención completa | Tomar, resolver, comentar e historial | Pruebas de transiciones, concurrencia y rollback | Por qué se necesita una transacción |
| 5 — Inventario y consulta | Equipos, vínculos, filtros e indicadores | Permisos de equipos, código único y conteos reales | Relaciones y consultas de agregación |
| 6 — Calidad y presentación | Revisión visual, pruebas, medición, README y capturas | Recorrido completo reproducible, revisión móvil/teclado y comprobaciones automatizadas | Decisiones, límites, un error corregido y una medición |

La etapa 0 es una primera versión revisable: se ajusta cuando se descubre una necesidad, registrando la razón. Las etapas no equivalen necesariamente a un solo commit.

## Protocolo de cada entrega

1. Escribir la historia, criterios de aceptación y contrato afectado.
2. Explicar brevemente los conceptos y acordar una tarea concreta que Maty pueda ejecutar, revisar o modificar.
3. Implementar el cambio mínimo coherente y revisar su diferencia.
4. Verificar los criterios con pruebas proporcionales al riesgo.
5. Actualizar documentación y registrar evidencia real de lo ejecutado.
6. Crear uno o varios commits completos y explicar sus cambios.
7. Cerrar con una explicación de Maty: qué hace, por qué y cómo se verificó. Si algo no se entiende, resolverlo antes de ampliar la función.

No convertir cada decisión rutinaria en una solicitud de aprobación. Sí explicar decisiones que cambien el alcance y respetar las pausas de aprendizaje que Maty pida.

## Próxima sesión: etapa 1

- Verificar versiones soportadas en documentación oficial y registrar las elegidas.
- Preparar comandos para ejecutar interfaz y servidor y variables de entorno de ejemplo.
- Definir cómo ejecutar PostgreSQL localmente según herramientas disponibles.
- Crear el endpoint de salud, comprobar conexión y mostrar una pantalla inicial sencilla.
- Documentar los pasos exactos que realmente funcionaron.

## Plan de calidad

- Tipos, formato y análisis estático automatizados desde la primera implementación.
- Pruebas HTTP para permisos y reglas; PostgreSQL de prueba aislado para consultas y transacciones. No ejecutar pruebas destructivas sobre datos de desarrollo.
- Pruebas de lógica aislada solo donde exista lógica propia; evitar pruebas que repitan la implementación sin detectar fallos relevantes.
- Al completar el flujo, automatizar al menos un recorrido de navegador con una herramienta elegida en esa etapa.
- Revisar estados de carga, vacío, error y éxito; teclado y vista móvil.
- Incorporar integración continua en GitHub cuando exista remoto autorizado. Hasta entonces, ejecutar los mismos controles localmente.

## Evidencias finales pendientes

README de instalación, configuración, migraciones, datos demo y comandos; capturas; recorrido de demostración; registro de un error reproducido y corregido; análisis de una consulta; limitaciones y decisiones actualizadas. Ninguna evidencia se marca como completada sin ejecutarla.
