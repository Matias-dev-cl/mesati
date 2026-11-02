# Recuperación de Docker — 2 de noviembre de 2026

Docker Desktop arrancó al abrirlo mediante el Explorador de Windows. No se reinstaló ni se borraron datos, contenedores o volúmenes existentes. Para próximos arranques, abrir Docker Desktop desde Inicio de Windows.

El resultado coincide con un [reporte sobre virtualización de AppData al iniciar Docker desde Codex](https://github.com/openai/codex/issues/52698). Esa explicación es probable; no se realizó una traza del sistema para demostrarla en este equipo.

## Evidencia real

- Motor Docker: 29.7.2.
- `npm.cmd run db:up`: contenedor `mesati-db-1` saludable.
- `SELECT version()` confirma PostgreSQL 17.11.
- Petición a `http://127.0.0.1:5173/api/v1/health`: 200 con `database: up`.
- Tras `docker compose stop db`: 503 con `database: down`.
- Tras `docker compose up -d --wait`: 200 con `database: up`.
- Digest observado: `postgres@sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73`.

Este resultado resuelve el bloqueo descrito en la guía de entorno y el plan anterior. La base quedó funcionando. La revisión visual permanece pendiente porque la herramienta del navegador falló; la comprobación HTTP sí atravesó el mismo proxy que usa React. También queda pendiente el repaso de aprendizaje con Maty.
