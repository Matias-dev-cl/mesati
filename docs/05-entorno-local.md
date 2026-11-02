# Entrega 1: entorno mínimo

## Objetivo y criterios de aceptación

Comprobar el recorrido navegador → API → PostgreSQL antes de construir tickets.

- La interfaz React consulta `/api/v1/health` y muestra carga, conexión correcta o indisponibilidad.
- La API ejecuta `SELECT 1`; responde 200 si la base contesta y 503 si falla, sin exponer credenciales ni errores internos.
- Una ruta desconocida devuelve 404 en JSON.
- PostgreSQL se ejecuta aislado en Docker, con puerto ligado solo a la máquina local y volumen persistente.
- Existen controles de formato, análisis estático, tipos, pruebas HTTP y compilación.

## Herramientas y fuentes

Se utiliza Node.js 24 (instalado: 24.19.0), npm workspaces y TypeScript estricto. Las versiones exactas de dependencias quedan registradas en `package-lock.json`; usar `npm ci` para reproducirlas.

Fuentes consultadas al iniciar esta entrega:

- [Ciclo de soporte de Node.js](https://nodejs.org/en/about/previous-releases).
- [Requisitos y funcionamiento de Vite](https://vite.dev/guide/).
- [Instalación de Express](https://expressjs.com/en/starter/installing/).
- [Soporte de PostgreSQL](https://www.postgresql.org/support/versioning/).

La configuración local, los comandos y las evidencias se completan al verificar la implementación de esta entrega.
