# FleetProof Frontend · BLIP

Frontend Angular para TB1 / Sprint 2 de Desarrollo de Aplicaciones Open Source. Sigue los patrones DDD del proyecto docente `learning-center`: entidades y comandos en `domain/model`, estado y casos de uso en `application`, endpoints y assemblers en `infrastructure`, vistas y componentes en `presentation`.

## Ejecución en WebStorm

1. Abrir esta carpeta como proyecto. Configurar Node.js 24.15 o superior de la rama 24, o Node.js 22.22.3 o superior de la rama 22, compatibles con Angular 22.
2. Ejecutar `npm ci` y `npm run dev` en la terminal. También pueden ejecutarse los scripts `api` y `start` por separado desde `package.json`.
3. Abrir http://127.0.0.1:4200. La API simulada se ejecuta en http://127.0.0.1:3000/api/v1.
4. Acceder con `demo@fleetproof.pe` y `FleetProof2026!`, o registrar una cuenta de demostración.

Los datos son sintéticos. JSON Server no proporciona autenticación ni autorización reales: la validación de acceso y el aislamiento visual por usuario son simulaciones educativas. No introducir datos personales, credenciales reales ni evidencia de vehículos reales. El registro de una cuenta nueva empieza sin vehículos.

## DDD y reutilización

- `shared`: infraestructura HTTP, contratos de entidades y assemblers, estados de carga/error, componentes visuales, idioma y layout. Los contratos BaseEntity, BaseResource, BaseResponse, BaseAssembler y BaseApi provienen de la base docente; BaseApiEndpoint se adapta a arrays de JSON Server y conserva errores HTTP.
- `iam`: acceso simulado y perfil.
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

`npm run build` produce `dist/fleetproof/browser`. `public/_redirects` permite rutas SPA en Netlify. Antes de desplegar, configurar `platformProviderApiBaseUrl` en `src/environments/environment.ts` con una API accesible, o preparar un proxy para la ruta relativa `/api/v1`. Esa ruta no crea una API: un hosting estático por sí solo no proporciona el backend. Publicar JSON Server requiere un servicio separado y no ofrece seguridad de producción. Esta preparación no constituye evidencia de un despliegue realizado ni implementación del backend definitivo.

Las consultas generan reportes únicamente a partir de fixtures locales. Las fuentes no disponibles se muestran explícitamente. Los ciclos de monitoreo se ejecutan por acción del usuario; no hay scraping, acceso a portales oficiales, elusión de CAPTCHA, cobros ni notificaciones externas.

## Alineación con la Base Actualizada

Las entidades tienen campos privados ECMAScript y acceso explícito; los recursos HTTP se declaran en infraestructura. La presentación distingue views y components. BaseForm centraliza validación de formularios. El parser CSV se mantiene fuera del dominio.

Consultar docs/adrs.md, docs/user-stories.md y docs/class-diagram.puml para decisiones, trazabilidad y relaciones principales. Angular y Material están actualizados a 22.2.1, TypeScript a 6.0.3 y ngx-translate a 18. La migración se realizó por etapas con Angular CLI, de 20 a 21 y de 21 a 22.

## Environments del Curso

Se reutiliza el patrón de configuración del profesor: `production`, `platformProviderApiBaseUrl` y propiedades `platformProvider...EndpointPath`. Los endpoints consumen estas propiedades, sin rutas de recursos incrustadas en los servicios.

- `environment.ts`: producción con la URL absoluta `https://fleetproof-fake-api.onrender.com`; consume recursos sin prefijo, por ejemplo `/users`.
- `environment.development.ts`: configuración local con JSON Server en `http://127.0.0.1:3000/api/v1`.
- `angular.json`: la configuración development reemplaza el archivo de producción, igual que Learning Center. `npm start` utiliza development; `npm run build` utiliza production.

Se conservan los recursos propios de FleetProof. IAM sigue usando `/users` para la simulación local; no se anuncian endpoints de autenticación real que JSON Server no implementa. No se incorpora el proveedor de logos porque FleetProof no consume ese servicio.

## Raíz del Proyecto

La raíz sigue Learning Center con .editorconfig, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, db.json, eslint.config.js y tsconfig.spec.json. La base db.json se trasladó sin modificar sus datos; routes.json mantiene el prefijo /api/v1 del mock. npm run server inicia la API; api permanece como alias para npm run dev.

.idea, node_modules, dist, .angular, out-tsc y coverage son archivos locales o generados, no entregables.

La auditoría del 29/10/2026 encontró 11 alertas npm (3 críticas). Se actualizaron dependencias transitivas dentro de los rangos compatibles, sin `--force`; `npm audit` pasó a 0 alertas conocidas. Esto no convierte el mock en un sistema seguro de producción y debe verificarse de nuevo al cambiar dependencias.

## Demostración y límites del dominio

El segmento inicial de la demostración es una pequeña flota de reparto. El recorrido es: registrar vehículo, generar snapshot, activar monitoreo manual, ejecutar un ciclo que detecta un cambio sintético, abrir la alerta, consultar el reporte, crear un caso con responsable, registrar una referencia de evidencia y resolverlo. Un caso resuelto conserva las revisiones de atención y no modifica los snapshots históricos ni certifica una regularización oficial.

Las referencias de evidencia son texto, no archivos adjuntos ni validación documental. La primera edición de un caso antiguo captura su estado anterior en ese momento: no reconstruye eventos históricos ausentes. El historial es editable mediante la Fake API y no constituye un registro inmutable. No existen roles ni autorización de servidor; un control del cliente no protege los datos contra llamadas directas.

Fixtures de fuentes y fecha de generación del snapshot representan una simulación. No prueban vigencia oficial de SOAT/CITV, discrepancias reales entre registros ni verificaciones externas. La disponibilidad incompleta produce reporte parcial y no debe mostrar riesgo bajo sin cobertura. Las pruebas de usabilidad con personas y la medición de mejoras de tiempo no se han realizado como parte de esta auditoría.
