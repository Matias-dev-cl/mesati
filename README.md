# MesaTI

Proyecto de aprendizaje y portafolio: una mesa de ayuda TI con inventario básico de equipos para una empresa ficticia.

**Estado:** entorno local conectado a PostgreSQL real. Docker funciona y se verificaron respuestas 200, 503 al detener la base y 200 al recuperarla. Queda pendiente el repaso de aprendizaje. Todavía no hay tickets, cuentas demo ni despliegue.

## Propósito

Practicar desarrollo full stack con React, TypeScript, Node.js, Express y PostgreSQL, conectando problemas de soporte TI con decisiones de software que el autor pueda explicar y defender.

El escenario de demostración será: un solicitante informa una falla, un técnico la toma, registra su diagnóstico y la resuelve; el historial y los indicadores reflejan los cambios persistidos.

## Documentación

- [Alcance, usuarios y reglas](docs/01-producto.md).
- [Arquitectura y decisiones iniciales](docs/02-arquitectura.md).
- [Modelo de datos y contrato de API propuesto](docs/03-datos-api.md).
- [Plan de entregas y aprendizaje](docs/04-plan.md).
- [Guía de contribución, commits y calidad](CONTRIBUTING.md).
- [Instalación local, verificaciones y guía de aprendizaje](docs/05-entorno-local.md).

## Tecnologías acordadas

| Área         | Elección                       | Propósito                                       |
| ------------ | ------------------------------ | ----------------------------------------------- |
| Interfaz     | React + TypeScript             | Formularios y navegación con tipos explícitos   |
| API          | Node.js + Express + TypeScript | Entender HTTP, validaciones y reglas de negocio |
| Persistencia | PostgreSQL                     | Relaciones, SQL, transacciones y consultas      |
| Pruebas      | Vitest + Supertest             | Comprobar lógica y comportamiento HTTP          |
| Versionado   | Git                            | Cambios pequeños y trazables                    |

Las versiones exactas están fijadas en los archivos `package.json` y `package-lock.json`. El entorno usa Node.js 24 y PostgreSQL 17 mediante Docker Compose.

## Ejecutar localmente

Requisitos: Node.js 24, npm y Docker Desktop iniciado con motor Linux. Desde la raíz del repositorio, en PowerShell:

```powershell
npm.cmd ci
# Solo la primera vez, si no existe .env:
Copy-Item .env.example .env
npm.cmd run db:up
```

Abrir dos terminales en la misma carpeta:

```powershell
# Terminal 1
npm.cmd run dev:api
```

```powershell
# Terminal 2
npm.cmd run dev:web
```

Abrir [MesaTI local](http://127.0.0.1:5173/). La API está en `http://127.0.0.1:3001/api/v1/health`. Sin PostgreSQL disponible, devuelve 503 y la pantalla indica conexión no disponible. Las instrucciones detalladas y el bloqueo actual están en [la guía del entorno](docs/05-entorno-local.md).

En otros sistemas se puede usar `npm` en lugar de `npm.cmd` y copiar el ejemplo de entorno con la herramienta correspondiente. No se han verificado todavía esos sistemas.

## Verificación

```powershell
npm.cmd run check
```

Ejecuta formato, análisis estático, tipos, 10 pruebas automatizadas y compilación. Las pruebas HTTP simulan la respuesta de la consulta: no sustituyen una comprobación con PostgreSQL real. El código compilado aún no incluye una configuración de despliegue para servir interfaz y API juntas.

## Qué se podrá demostrar al terminar

- Recorrido completo con dos roles, datos ficticios y permisos verificables.
- Instrucciones de instalación desde un clon limpio, migraciones y carga de datos demo.
- Pruebas de reglas importantes y evidencias de depuración y rendimiento.
- Capturas y decisiones documentadas, con limitaciones conocidas.

Un proyecto personal no acredita experiencia laboral en equipo. El README final distinguirá lo implementado, lo practicado y lo pendiente.

## Cómo trabajar en este proyecto

Consultar primero [el plan](docs/04-plan.md) y [la guía de contribución](CONTRIBUTING.md). Antes de implementar una entrega, identificar su problema, criterios de aceptación, forma de verificarla y conceptos que se deben comprender.

El siguiente paso es recuperar el funcionamiento de Docker, comprobar el estado 200 con PostgreSQL real y repasar el recorrido de una petición antes de empezar los tickets. La publicación y el despliegue quedan fuera de esta entrega.
