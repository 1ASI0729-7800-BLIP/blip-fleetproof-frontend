# Decisiones Arquitectónicas

## ADR-001: Contextos y Capas

FleetProof conserva los contextos IAM, información vehicular, reportes, monitoreo y gestión de flotas. Cada contexto separa dominio, aplicación, infraestructura y presentación. El dominio no importa Angular, HTTP, componentes ni librerías de parsing. Los contratos HTTP se declaran en infrastructure/resources.ts y los assemblers traducen entidades y recursos explícitamente.

Las entidades utilizan campos privados ECMAScript y getters. Los setters se limitan a los datos modificados por los casos de uso actuales. No se utiliza object spread para serializar entidades: sus campos privados no son enumerables. La sesión IAM persiste un objeto explícito y reconstruye la entidad al restaurar.

## ADR-002: Presentación y Formularios

Las páginas enrutadas se ubican en presentation/views; tablas, diálogos y controles reutilizables en presentation/components. BaseForm centraliza la comprobación del formulario y su marcado como touched; los validadores y mensajes traducidos permanecen en cada formulario.

## ADR-003: CSV

PapaParse es un adaptador de infraestructura. Convierte texto en filas; el dominio valida placas, duplicados, años, columnas obligatorias y cuota. La persistencia secuencial permanece en la capa de aplicación. Una importación parcialmente persistida se informa como tal, sin prometer transacciones.

## ADR-004: Versiones e integración del backend

Se migra a Angular/Material 22.2.1, TypeScript 6.0.3 y ngx-translate 18 con las migraciones oficiales 20 a 21 y 21 a 22. Angular CLI añade ChangeDetectionStrategy.Eager para conservar el comportamiento anterior y withXhr para conservar el transporte HTTP. Se reemplaza lucide-angular por @lucide/angular, compatible con Angular 22; un componente shared mantiene los controles de iconos existentes.

Node.js debe cumplir ^22.22.3, ^24.15.0 o >=26.0.0. La aplicación consume el REST API Spring Boot mediante los environments de Angular. JSON Server, `db.json` y `routes.json` fueron retirados al dejar de formar parte de la ejecución.

Jasmine se mantiene en la última versión de la rama 5 (5.13.0): Jasmine 6 produce un error al cargar zone-testing porque sus globals son de solo lectura. TypeScript 7 queda fuera del rango admitido por Angular 22.2.1 (>=6.0 <6.1); los tipos Node permanecen en la rama 24, correspondiente al runtime utilizado.

El backend valida el acceso y no expone hashes de contraseña en recursos públicos. Las fuentes oficiales permanecen marcadas como no disponibles mientras no existan contratos y credenciales oficiales; el frontend no fabrica hallazgos. Las traducciones se cargan por HTTP desde public/i18n y no dependen de Postman.

## ADR-005: Verificación

ESLint comprueba TypeScript con reglas recomendadas y prohíbe any explícito. La compilación comprueba también las plantillas Angular en modo estricto.

Para alinearse con Learning Center, npm test utiliza Jasmine/Karma mediante @angular/build:karma y tsconfig.spec.json. Se preserva el aviso MIT del código docente en LICENSE.md.
