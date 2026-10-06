# Trazabilidad Funcional

Esta tabla identifica capacidades implementadas, no sustituye los identificadores oficiales del backlog del informe.

| Capacidad | Contexto | Vista | Evidencia automatizada |
|---|---|---|---|
| Acceso, registro y perfil simulados | iam | auth-view, profile-view | guard, wrong credentials; new account |
| Consultar estado general | shared | dashboard | ES/EN persistence, desktop y mobile |
| Registrar y buscar vehículos | vehicle-information | vehicles-view, vehicle-detail | vehicle creation, duplicate protection |
| Consultar fuentes y exportar PDF | report-management | reports-view, report-detail | partial report, PDF export |
| Comparar snapshots | report-management | compare-view | historical comparison |
| Ejecutar ciclos y revisar alertas | vehicle-monitoring | monitoring-view, alerts-view | monitoring detects a new finding |
| Crear flotas e importar CSV | fleet-management | vehicles-view; fleet-dialog, csv-dialog | CSV validation and persisted import |
| Registrar atención y resolver con evidencia | fleet-management | cases-view; case-dialog | case resolution requires evidence |
| Cambiar idioma y recuperarse de errores | shared | language-switcher, state-message | ES/EN persistence; API failure and retry |

La creación de flotas tiene comprobación de tipos y compilación, pero todavía requiere una prueba de navegador específica. Las evidencias de despliegue y las contribuciones personales de cada integrante deben documentarse cuando realmente se realicen.
