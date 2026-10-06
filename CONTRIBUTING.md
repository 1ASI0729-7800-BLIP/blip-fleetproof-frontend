# Contribuciones a FleetProof

## Arquitectura

Organizar por bounded context y por domain/model, application, infrastructure y presentation. El dominio no depende de Angular, HTTP, parsing o UI. Separar recursos HTTP de entidades y convertirlos mediante assemblers. Usar campos privados ECMAScript y getters; serializar explícitamente.

Las vistas enrutadas pertenecen a presentation/views y los diálogos y controles a presentation/components. Reutilizar shared para contratos, infraestructura técnica, traducciones, layout y BaseForm. Evitar abstraer reglas propias del negocio dentro de shared.

## Calidad

Mantener TypeScript estricto, no usar any explícito, usar standalone components, inject y Signals. Añadir cada cadena de interfaz a los diccionarios español e inglés. Mantener accesibilidad y validar estados de carga, error y vacío.

Antes de integrar:

1. Ejecutar npm run lint.
2. Ejecutar npm test -- --watch=false --browsers=ChromeHeadless.
3. Ejecutar npm run build.
4. Actualizar decisiones arquitectónicas y trazabilidad cuando corresponda.

No introducir datos personales o credenciales reales en db.json.

## Git

Usar Conventional Commits con alcance del contexto: feat(iam), fix(reports), refactor(shared), test(app), docs(app), build(config). No falsificar autores ni registrar trabajo de compañeros como realizado sin evidencia.

El flujo de integración propuesto es feature hacia develop y release hacia main, con revisión del equipo. La rama actual contiene la preparación inicial; este documento no significa que develop o main ya existan. No publicar, mezclar o desplegar sin autorización.
