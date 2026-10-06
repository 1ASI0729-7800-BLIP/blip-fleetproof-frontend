# Decisiones Arquitectónicas

## ADR-001: Contextos y Capas

FleetProof conserva los contextos IAM, información vehicular, reportes, monitoreo y gestión de flotas. Cada contexto separa dominio, aplicación, infraestructura y presentación. El dominio no importa Angular, HTTP, componentes ni librerías de parsing. Los contratos HTTP se declaran en infrastructure/resources.ts y los assemblers traducen entidades y recursos explícitamente.

Las entidades utilizan campos privados ECMAScript y getters. Los setters se limitan a los datos modificados por los casos de uso actuales. No se utiliza object spread para serializar entidades: sus campos privados no son enumerables. La sesión IAM persiste un objeto explícito y reconstruye la entidad al restaurar.

## ADR-002: Presentación y Formularios

Las páginas enrutadas se ubican en presentation/views; tablas, diálogos y controles reutilizables en presentation/components. BaseForm centraliza la comprobación del formulario y su marcado como touched; los validadores y mensajes traducidos permanecen en cada formulario.

## ADR-003: CSV

PapaParse es un adaptador de infraestructura. Convierte texto en filas; el dominio valida placas, duplicados, años, columnas obligatorias y cuota. La persistencia secuencial permanece en la capa de aplicación. Una importación parcialmente persistida se informa como tal, sin prometer transacciones.

## ADR-004: Versiones y Simulación

Se migra a Angular/Material 22.2.1, TypeScript 6.0.3 y ngx-translate 18 con las migraciones oficiales 20 a 21 y 21 a 22. Angular CLI añade ChangeDetectionStrategy.Eager para conservar el comportamiento anterior y withXhr para conservar el transporte HTTP. Se reemplaza lucide-angular por @lucide/angular, compatible con Angular 22; un componente shared mantiene los controles de iconos existentes.

Node.js debe cumplir ^22.22.3, ^24.15.0 o >=26.0.0. JSON Server se conserva en 0.17.4 por compatibilidad con la base docente y las reescrituras de rutas. Se actualizan las otras dependencias a versiones estables compatibles, sin forzar peer dependencies ni adoptar prereleases del mock.

Jasmine se mantiene en la última versión de la rama 5 (5.13.0): Jasmine 6 produce un error al cargar zone-testing porque sus globals son de solo lectura. TypeScript 7 queda fuera del rango admitido por Angular 22.2.1 (>=6.0 <6.1); los tipos Node permanecen en la rama 24, correspondiente al runtime utilizado.

JSON Server es un mock local, sin autenticación ni autorización reales. Las fuentes y los reportes son sintéticos. Las traducciones se cargan por HTTP desde public/i18n y no dependen de Postman.

## ADR-005: Verificación

ESLint comprueba TypeScript con reglas recomendadas y prohíbe any explícito. La compilación comprueba también las plantillas Angular en modo estricto.

Para alinearse con Learning Center, npm test utiliza Jasmine/Karma mediante @angular/build:karma y tsconfig.spec.json, con la prueba básica de App. Se retiran las herramientas suplementarias de pruebas y environment.spec.ts. db.json se ubica en la raíz y routes.json conserva las reescrituras del mock. Se preserva el aviso MIT del código docente en LICENSE.md.
