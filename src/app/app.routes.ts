import { Routes } from "@angular/router";
import { Workspace } from "./shared/presentation/views/workspace";
import { Dashboard } from "./shared/presentation/views/dashboard";
import { iamGuard } from "./iam/infrastructure/iam.guard";
import { AuthView } from "./iam/presentation/views/auth-view";
import { ProfileView } from "./iam/presentation/views/profile-view";
import { VehiclesView } from "./vehicle-information/presentation/views/vehicles-view";
import { VehicleDetail } from "./vehicle-information/presentation/views/vehicle-detail";
import { ReportsView } from "./report-management/presentation/views/reports-view";
import { ReportDetail } from "./report-management/presentation/views/report-detail";
import { CompareView } from "./report-management/presentation/views/compare-view";
import { MonitoringView } from "./vehicle-monitoring/presentation/views/monitoring-view";
import { AlertsView } from "./vehicle-monitoring/presentation/views/alerts-view";
import { CasesView } from "./fleet-management/presentation/views/cases-view";
export const routes: Routes = [
  { path: "sign-in", component: AuthView },
  { path: "sign-up", component: AuthView, data: { register: true } },
  {
    path: "",
    component: Workspace,
    canActivate: [iamGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: Dashboard },
      { path: "profile", component: ProfileView },
      { path: "vehicles", component: VehiclesView },
      { path: "vehicles/:id", component: VehicleDetail },
      { path: "reports", component: ReportsView },
      { path: "reports/:id/compare", component: CompareView },
      { path: "reports/:id", component: ReportDetail },
      { path: "monitoring", component: MonitoringView },
      { path: "alerts", component: AlertsView },
      { path: "cases", component: CasesView },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];
