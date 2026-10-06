# FleetProof Frontend · BLIP

Frontend Angular para TB1 / Sprint 2 de Desarrollo de Aplicaciones Open Source. Sigue los patrones DDD del proyecto docente `learning-center`: entidades y comandos en `domain/model`, estado y casos de uso en `application`, endpoints y assemblers en `infrastructure`, vistas y componentes en `presentation`.

## Ejecución en WebStorm

1. Abrir esta carpeta como proyecto. Configurar Node.js 24.15 o superior de la rama 24, o Node.js 22.22.3 o superior de la rama 22, compatibles con Angular 22.
2. Ejecutar `npm install` y `npm run dev` en la terminal. También pueden ejecutarse los scripts `api` y `start` por separado desde `package.json`.
3. Abrir http://localhost:4200. La API simulada se ejecuta en http://127.0.0.1:3000/api/v1.
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
| 3 | Rodrigo Gómez De La Torre | Vehículos, reportes, riesgo y PDF |
| 4 | Jefferson Morales | Monitoreo, comparación histórica y alertas |
| 5 | Eduardo Gorbeña | Flotas, CSV, casos y verificación integral |

Los commits de preparación se crean con la identidad Git del autor efectivo. Para registrar contribuciones personales, cada integrante debe revisar su bloque y crear sus propios commits; no se falsifican autores. Esta división no implica que los integrantes ya hayan realizado el trabajo.

## i18n y Postman

`ngx-translate` carga `public/i18n/es.json` y `en.json` por HTTP. El selector persiste el idioma y las fechas se formatean con `Intl`. Postman prueba endpoints de datos y archivos de traducción; no traduce la interfaz. Importar `docs/postman/fleetproof.postman_collection.json` con ambos servidores iniciados.

## Verificación

- `npm run build`: compilación de producción.
- `npm run lint`: análisis estático TypeScript, sin warnings.
- `npm test -- --watch=false --browsers=ChromeHeadless`: pruebas Jasmine/Karma con Angular CLI; requiere Google Chrome o CHROME_BIN configurado.

Se conserva la prueba básica de la aplicación con Jasmine/Karma, siguiendo la base del curso. No se requieren herramientas adicionales de pruebas.

Los capítulos suministrados describen Vue/PrimeVue en algunos apartados. Esta implementación usa Angular/Material conforme a la base docente indicada para esta tarea; el informe deberá alinearse con la tecnología implementada antes de la entrega.

## Despliegue

`npm run build` produce `dist/fleetproof/browser`. `public/_redirects` permite rutas SPA en Netlify. Antes de desplegar, configurar `platformProviderApiBaseUrl` en `src/environments/environment.ts` con una API accesible, o preparar un proxy para la ruta relativa `/api/v1`. Esa ruta no crea una API: un hosting estático por sí solo no proporciona el backend. Publicar JSON Server requiere un servicio separado y no ofrece seguridad de producción. Esta preparación no constituye evidencia de un despliegue realizado ni implementación del backend definitivo.

Las consultas generan reportes únicamente a partir de fixtures locales. Las fuentes no disponibles se muestran explícitamente. Los ciclos de monitoreo se ejecutan por acción del usuario; no hay scraping, acceso a portales oficiales, elusión de CAPTCHA, cobros ni notificaciones externas.

## Alineación con la Base Actualizada

Las entidades tienen campos privados ECMAScript y acceso explícito; los recursos HTTP se declaran en infraestructura. La presentación distingue views y components. BaseForm centraliza validación de formularios. El parser CSV se mantiene fuera del dominio.

Consultar docs/adrs.md, docs/user-stories.md y docs/class-diagram.puml para decisiones, trazabilidad y relaciones principales. Angular y Material están actualizados a 22.2.1, TypeScript a 6.0.3 y ngx-translate a 18. La migración se realizó por etapas con Angular CLI, de 20 a 21 y de 21 a 22.

## Environments del Curso

Se reutiliza el patrón de configuración del profesor: `production`, `platformProviderApiBaseUrl` y propiedades `platformProvider...EndpointPath`. Los endpoints consumen estas propiedades, sin rutas de recursos incrustadas en los servicios.

- `environment.ts`: configuración de producción, con base relativa `/api/v1` pendiente de API/proxy para despliegue.
- `environment.development.ts`: configuración local con JSON Server en `http://127.0.0.1:3000/api/v1`.
- `angular.json`: la configuración development reemplaza el archivo de producción, igual que Learning Center. `npm start` utiliza development; `npm run build` utiliza production.

Se conservan los recursos propios de FleetProof. IAM sigue usando `/users` para la simulación local; no se anuncian endpoints de autenticación real que JSON Server no implementa. No se incorpora el proveedor de logos porque FleetProof no consume ese servicio.

## Raíz del Proyecto

La raíz sigue Learning Center con .editorconfig, CHANGELOG.md, CONTRIBUTING.md, LICENSE.md, db.json, eslint.config.js y tsconfig.spec.json. La base db.json se trasladó sin modificar sus datos; routes.json mantiene el prefijo /api/v1 del mock. npm run server inicia la API; api permanece como alias para npm run dev.

.idea, node_modules, dist, .angular, out-tsc y coverage son archivos locales o generados, no entregables.

La configuración Jasmine/Karma heredada de la referencia introduce seis alertas altas de npm audit en dependencias de desarrollo (Karma y su cadena braces/chokidar). No ejecutar npm audit fix --force sin revisar sus cambios incompatibles. Esto no sustituye una revisión de seguridad del backend; el mock sigue sin seguridad de producción.
