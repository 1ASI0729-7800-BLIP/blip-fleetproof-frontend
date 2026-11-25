# FleetProof Frontend · BLIP

Frontend Angular para TB1 / Sprint 2 de Desarrollo de Aplicaciones Open Source. Sigue los patrones DDD del proyecto docente `learning-center`: entidades y comandos en `domain/model`, estado y casos de uso en `application`, endpoints y assemblers en `infrastructure`, vistas y componentes en `presentation`.

## Ejecución en WebStorm

1. Abrir esta carpeta como proyecto. Configurar Node.js 24.15 o superior de la rama 24, o Node.js 22.22.3 o superior de la rama 22, compatibles con Angular 22.
2. Ejecutar `npm ci` y `npm run dev` en la terminal.
3. Iniciar el backend Spring Boot en `http://localhost:8080`.
4. Abrir `http://127.0.0.1:4200` y registrar una cuenta.

El frontend consume el REST API Spring Boot. Las fuentes oficiales SUNARP, SAT, CITV y SOAT se muestran como no disponibles mientras no existan contratos y credenciales oficiales; no se fabrican hallazgos. No introducir datos personales ni evidencia vehicular real durante demostraciones.

## DDD y reutilización

- `shared`: infraestructura HTTP, contratos de entidades y assemblers, estados de carga/error, componentes visuales, idioma y layout.
- `iam`: registro, inicio de sesión validado por backend y perfil.
- `vehicle-information`: registro de vehículos y validación de placas.
- `report-management`: reportes, fuentes, evaluación explicable y snapshots.
- `vehicle-monitoring`: ciclos manuales de demostración y alertas.
- `fleet-management`: flotas, carga CSV y casos de resolución.

Las vistas delegan persistencia y reglas a stores/servicios. Los recursos JSON se convierten mediante assemblers. La base `learning-center` mantiene su licencia MIT; se conserva su aviso en `docs/THIRD_PARTY_NOTICES.md`.

## Cinco bloques de colaboración

| Bloque | Responsable propuesto | Alcance |
|---|---|---|
| 1 | Sebastian Reyes | Base Angular, shared, layout, i18n y configuración local |
| 2 | Gonzalo Quintanilla | IAM: acceso, registro y perfil |
| 3 | Rodrigo Gómez De La Torre | Reportes, riesgo, comparación y PDF |
| 4 | Jefferson Morales | Monitoreo y alertas |
| 5 | Eduardo Gorbeña | Vehicle Information: registro, listado y consulta |

Fleet Management, CSV y casos corresponden también al bloque de Sebastian. La distribución refleja el capítulo V del informe; no prueba por sí sola ejecución o aceptación. Los commits se crean con la identidad del autor efectivo; no se falsifican autores.

## i18n y Postman

`ngx-translate` carga `public/i18n/es.json` y `en.json` por HTTP. El selector persiste el idioma y las fechas se formatean con `Intl`. Postman prueba endpoints de datos y archivos de traducción; no traduce la interfaz. Importar `docs/postman/fleetproof.postman_collection.json` con ambos servidores iniciados.

## Verificación

- `npm run build`: compilación de producción.
- `npm run lint`: análisis estático TypeScript, sin warnings.
- `npm test -- --watch=false --browsers=ChromeHeadless`: pruebas Jasmine/Karma con Angular CLI; requiere Google Chrome o CHROME_BIN configurado.

Las pruebas Jasmine/Karma incluyen reglas de riesgo, comparación de fuentes, conservación del historial de casos y evidencia de cierre. No se requieren dependencias adicionales para las pruebas unitarias.

Los capítulos suministrados describen Vue/PrimeVue en algunos apartados. Esta implementación usa Angular/Material conforme a la base docente indicada para esta tarea; el informe deberá alinearse con la tecnología implementada antes de la entrega.

## Despliegue

`npm run build` produce `dist/fleetproof/browser`. `public/_redirects` permite rutas SPA en Netlify. `src/environments/environment.ts` apunta al backend Railway y `environment.development.ts` usa `http://localhost:8080/api/v1`.

La consulta de fuentes se solicita al backend. Sin integraciones oficiales configuradas, el backend devuelve las fuentes como no disponibles. No hay scraping, acceso automatizado a portales, elusión de CAPTCHA, cobros ni notificaciones externas.

## Alineación con la Base Actualizada

Las entidades tienen campos privados ECMAScript y acceso explícito; los recursos HTTP se declaran en infraestructura. La presentación distingue views y components. BaseForm centraliza validación de formularios. El parser CSV se mantiene fuera del dominio.

Consultar docs/adrs.md, docs/user-stories.md y docs/class-diagram.puml para decisiones, trazabilidad y relaciones principales. Angular y Material están actualizados a 22.2.1, TypeScript a 6.0.3 y ngx-translate a 18. La migración se realizó por etapas con Angular CLI, de 20 a 21 y de 21 a 22.

## Environments del Curso

Se reutiliza el patrón de configuración del profesor: `production`, `platformProviderApiBaseUrl` y propiedades `platformProvider...EndpointPath`. Los endpoints consumen estas propiedades, sin rutas de recursos incrustadas en los servicios.

- `environment.ts`: producción con `https://blip-fleetproof-backend-production.up.railway.app/api/v1`.
- `environment.development.ts`: backend local en `http://localhost:8080/api/v1`.
- `angular.json`: la configuración development reemplaza el archivo de producción, igual que Learning Center. `npm start` utiliza development; `npm run build` utiliza production.

IAM registra usuarios en `/users` e inicia sesión mediante `/users/sign-in`. Los recursos de usuario no incluyen `passwordHash`.

## Raíz del Proyecto

La raíz conserva `.editorconfig`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE.md`, `eslint.config.js` y `tsconfig.spec.json`. `db.json` y `routes.json` fueron eliminados porque la aplicación utiliza el backend Spring Boot.

.idea, node_modules, dist, .angular, out-tsc y coverage son archivos locales o generados, no entregables.

La auditoría del 29/10/2026 encontró 11 alertas npm (3 críticas). Se actualizaron dependencias transitivas dentro de los rangos compatibles, sin `--force`; `npm audit` pasó a 0 alertas conocidas. Esto no convierte el mock en un sistema seguro de producción y debe verificarse de nuevo al cambiar dependencias.

## Demostración y límites del dominio

El segmento inicial de la demostración es una pequeña flota de reparto. El recorrido es: registrar vehículo, generar snapshot, activar monitoreo manual, ejecutar un ciclo que detecta un cambio sintético, abrir la alerta, consultar el reporte, crear un caso con responsable, registrar una referencia de evidencia y resolverlo. Un caso resuelto conserva las revisiones de atención y no modifica los snapshots históricos ni certifica una regularización oficial.

Las referencias de evidencia son texto, no archivos adjuntos ni validación documental. La primera edición de un caso antiguo captura su estado anterior en ese momento: no reconstruye eventos históricos ausentes. El historial es editable mediante la Fake API y no constituye un registro inmutable. No existen roles ni autorización de servidor; un control del cliente no protege los datos contra llamadas directas.

Fixtures de fuentes y fecha de generación del snapshot representan una simulación. No prueban vigencia oficial de SOAT/CITV, discrepancias reales entre registros ni verificaciones externas. La disponibilidad incompleta produce reporte parcial y no debe mostrar riesgo bajo sin cobertura. Las pruebas de usabilidad con personas y la medición de mejoras de tiempo no se han realizado como parte de esta auditoría.
