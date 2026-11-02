# MesaTI

Proyecto de aprendizaje y portafolio: una mesa de ayuda TI con inventario básico de equipos para una empresa ficticia.

**Estado:** planificación inicial. Todavía no hay una aplicación ejecutable, cuentas demo ni despliegue. Las funciones descritas son objetivos, no funcionalidades implementadas.

## Propósito

Practicar desarrollo full stack con React, TypeScript, Node.js, Express y PostgreSQL, conectando problemas de soporte TI con decisiones de software que el autor pueda explicar y defender.

El escenario de demostración será: un solicitante informa una falla, un técnico la toma, registra su diagnóstico y la resuelve; el historial y los indicadores reflejan los cambios persistidos.

## Documentación

- [Alcance, usuarios y reglas](docs/01-producto.md).
- [Arquitectura y decisiones iniciales](docs/02-arquitectura.md).
- [Modelo de datos y contrato de API propuesto](docs/03-datos-api.md).
- [Plan de entregas y aprendizaje](docs/04-plan.md).
- [Guía de contribución, commits y calidad](CONTRIBUTING.md).

## Tecnologías acordadas

| Área | Elección | Propósito |
| --- | --- | --- |
| Interfaz | React + TypeScript | Formularios y navegación con tipos explícitos |
| API | Node.js + Express + TypeScript | Entender HTTP, validaciones y reglas de negocio |
| Persistencia | PostgreSQL | Relaciones, SQL, transacciones y consultas |
| Pruebas | Vitest + Supertest | Comprobar lógica y comportamiento HTTP |
| Versionado | Git | Cambios pequeños y trazables |

Las versiones concretas y las dependencias adicionales se verificarán al iniciar la implementación. No hay dependencias instaladas todavía.

## Qué se podrá demostrar al terminar

- Recorrido completo con dos roles, datos ficticios y permisos verificables.
- Instrucciones de instalación desde un clon limpio, migraciones y carga de datos demo.
- Pruebas de reglas importantes y evidencias de depuración y rendimiento.
- Capturas y decisiones documentadas, con limitaciones conocidas.

Un proyecto personal no acredita experiencia laboral en equipo. El README final distinguirá lo implementado, lo practicado y lo pendiente.

## Cómo trabajar en este proyecto

Consultar primero [el plan](docs/04-plan.md) y [la guía de contribución](CONTRIBUTING.md). Antes de implementar una entrega, identificar su problema, criterios de aceptación, forma de verificarla y conceptos que se deben comprender.

El siguiente paso es revisar las reglas del producto y construir la primera entrega ejecutable. No publicar el repositorio ni desplegarlo como parte de esta fase documental.
