# Guía de trabajo

## Antes de escribir código

Leer el alcance y la entrega activa. Definir entradas, salidas, permisos y criterios de aceptación. No agregar dependencias o funciones sin una necesidad explicable. Mantener la documentación junto al cambio que la afecta.

## Código limpio y comentarios

- Identificadores de código en inglés; interfaz y documentación en español.
- TypeScript estricto; evitar `any` salvo una excepción justificada y acotada.
- Funciones con una responsabilidad clara y nombres que expresen intención.
- Validar datos externos en los límites y tratar errores de forma consistente.
- Comentar el motivo de una decisión, una restricción o una solución no evidente. No narrar instrucciones obvias ni dejar código desactivado como comentario.
- Documentar contratos públicos y reglas de negocio que no se deduzcan con claridad de los nombres.
- No abstraer por anticipación; primero entender el caso concreto.
- Nunca guardar secretos, datos reales, dependencias instaladas ni archivos generados.

## Commits

Cada commit debe contener una unidad coherente y revisable. No fijar una cantidad artificial ni mezclar documentación de una función con cambios ajenos. Verificar antes de registrar; dejar explícito si una comprobación no se pudo ejecutar.

Formato del asunto: `tipo(área): descripción en español`, en imperativo.

Tipos: `docs`, `feat`, `fix`, `refactor`, `test`, `chore`. Cuerpo: problema o motivo, cambio relevante y verificación efectuada cuando sea útil. Los comandos exactos se documentarán cuando existan; no inventar resultados.

Ejemplo de commit futuro:

```text
feat(tickets): impedir que otro técnico resuelva una solicitud

Verifica que la sesión corresponda al técnico asignado antes de
guardar la resolución. Mantiene el ticket y su historial sin cambios
cuando se rechaza la operación.

Verificación: [anotar aquí la prueba realmente ejecutada y su resultado].
```

Antes de cada commit: revisar `git diff`, preparar solo archivos del cambio, revisar `git diff --cached`, ejecutar verificaciones relevantes y `git diff --cached --check`.

Trabajar en ramas `codex/<cambio>` para futuras entregas. La base documental se registra en `main`. No publicar, desplegar ni enviar cambios al remoto durante esta fase inicial. No reescribir commits existentes sin necesidad y autorización.

## Revisión y definición de terminado

- El cambio cumple sus criterios y respeta permisos y reglas.
- No introduce secretos ni registra datos sensibles.
- Las validaciones necesarias pasan y se informa qué se verificó.
- Documentación y ejemplos reflejan el comportamiento real.
- Se revisó la diferencia para detectar código sobrante y cambios accidentales.
- Maty puede explicar el recorrido y la decisión principal.

Una revisión asistida o individual se identifica como tal; no se presenta como revisión de un equipo externo.
