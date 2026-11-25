# Changelog

## Unreleased

- Integración del frontend con el backend Spring Boot desplegable en Railway.
- Eliminación de `db.json`, `routes.json` y las referencias activas a JSON Server.
- Autenticación delegada al backend sin exponer hashes en las respuestas de usuarios.
- Evaluación de fuentes de reportes solicitada al backend en lugar de fabricarse en Angular.
- Pruebas Jasmine/Karma con Angular CLI y tsconfig.spec.json.
- Playwright y pruebas de dominio conservadas como verificación adicional.
- Environments de desarrollo/producción con rutas de recursos configurables.
- Entidades encapsuladas, DTOs separados, BaseForm y presentación organizada por views/components.

## 1.0.0 - 2026-10-04

- Preparación inicial del frontend Angular de FleetProof para TB1/Sprint 2.
- Interfaz bilingüe, acceso simulado, vehículos, reportes PDF, snapshots, monitoreo, alertas, CSV y casos.

Estas versiones describen el código local; no acreditan releases remotos ni despliegues.
- Migración oficial por etapas a Angular y Material 22.2.1, TypeScript 6.0.3 y ngx-translate 18.
- Iconos actualizados a @lucide/angular y requisitos Node.js compatibles con Angular 22.
