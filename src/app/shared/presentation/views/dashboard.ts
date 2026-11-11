import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UI_IMPORTS } from "../ui-imports";
import { StateMessage } from "../components/state-message";
import { RiskBadge } from "../components/risk-badge";
import { LanguageStore } from "../../application/language.store";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { VehicleTable } from "../../../vehicle-information/presentation/components/vehicle-table";
import { VehicleDialog } from "../../../vehicle-information/presentation/components/vehicle-dialog";
import { ReportStore } from "../../../report-management/application/report.store";
import { IamStore } from "../../../iam/application/iam.store";
import { AlertStore } from "../../../vehicle-monitoring/application/alert.store";
@Component({
  imports: [...UI_IMPORTS, RouterLink, StateMessage, VehicleTable, RiskBadge],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <header class="dashboard-hero">
      <div>
        <h1>{{ "dashboard.greeting" | translate: { name: userName() } }}</h1>
        <p>{{ "dashboard.overview" | translate }}</p>
      </div>
      <div class="actions">
        <a mat-stroked-button routerLink="/reports"><lucide-icon name="search" size="18" />{{ "dashboard.quickQuery" | translate }}</a>
        <button mat-flat-button (click)="add()"><lucide-icon name="plus" size="18" />{{ "vehicle.add" | translate }}</button>
      </div>
    </header>

    <div class="dashboard-metrics">
      @for (metric of metrics(); track metric.label) {
        <a class="dashboard-metric" [class]="metric.tone" [routerLink]="metric.path" [queryParams]="metric.params">
          <lucide-icon [name]="metric.icon" size="21" />
          <span>{{ metric.label | translate }}</span>
          <strong>{{ metric.value ?? "—" }}</strong>
          <lucide-icon class="metric-arrow" name="arrow-right" size="16" />
        </a>
      }
    </div>

    <div class="dashboard-detail">
      <section class="section">
        <div class="section-heading">
          <h2>{{ "dashboard.fleetTitle" | translate }}</h2>
          <a mat-button routerLink="/vehicles">{{ "dashboard.viewAll" | translate }}<lucide-icon name="arrow-right" size="16" /></a>
        </div>
        <app-state-message [loading]="fleetLoading()" [error]="fleetError()" (retry)="load()" />
        @if (!fleetLoading() && !fleetError()) {
          @if (vehicles.items().length) {
            <div class="risk-filters" [attr.aria-label]="'vehicle.risk' | translate" role="group">
              @for (filter of filters; track filter.value) {
                <button mat-button type="button" [class.selected]="riskFilter() === filter.value"
                  [attr.aria-pressed]="riskFilter() === filter.value" (click)="riskFilter.set(filter.value)">
                  {{ filter.label | translate }}
                </button>
              }
            </div>
            @if (visibleVehicles().length) {
              <app-vehicle-table [vehicles]="visibleVehicles()" [reports]="reports.items()" />
            } @else {
              <app-state-message [empty]="true" />
            }
          } @else {
            <div class="dashboard-empty">
              <lucide-icon name="truck" size="26" />
              <p>{{ "dashboard.firstVehicle" | translate }}</p>
              <button mat-stroked-button (click)="add()">{{ "vehicle.add" | translate }}</button>
            </div>
          }
        }
      </section>

      <section class="section">
        <div class="section-heading">
          <h2>{{ "dashboard.recentReports" | translate }}</h2>
          <a mat-button routerLink="/reports">{{ "dashboard.viewAll" | translate }}</a>
        </div>
        <app-state-message [loading]="reports.loading()" [error]="reports.error()" (retry)="load()" />
        @if (!reports.loading() && !reports.error()) {
          @for (report of recent(); track report.id) {
            <a class="row-link" [routerLink]="['/reports', report.id]">
              <div><strong>{{ report.plate }}</strong>
                <span class="secondary">v{{ report.version }} · {{ language.date(report.createdAt) }}</span>
              </div>
              <app-risk-badge [risk]="report.risk" />
            </a>
          } @empty {
            <div class="dashboard-empty">
              <p>{{ "dashboard.firstReport" | translate }}</p>
              <a mat-stroked-button routerLink="/reports">{{ "dashboard.quickQuery" | translate }}</a>
            </div>
          }
        }
      </section>
    </div>

    <section class="dashboard-contexts" aria-labelledby="dashboard-tools">
      <h2 id="dashboard-tools">{{ "dashboard.tools" | translate }}</h2>
      <div class="context-grid">
        @for (context of contexts; track context.path) {
          <a class="context-card" [routerLink]="context.path">
            <lucide-icon [name]="context.icon" size="21" />
            <div><strong>{{ context.label | translate }}</strong><span>{{ context.action | translate }}</span></div>
            <lucide-icon name="chevron-right" size="16" />
          </a>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .dashboard-hero {
      display: flex; justify-content: space-between; align-items: end; flex-wrap: wrap;
      gap: 1.25rem; padding: clamp(1rem, 3vw, 2rem); border-radius: 1rem;
      background: linear-gradient(110deg, #12334c, #0c5968); color: white;
    }
    .dashboard-hero h1 { font-size: clamp(1.7rem, 3vw, 2.65rem); margin: 0; color: inherit; overflow-wrap: anywhere; }
    .dashboard-hero p { margin: .55rem 0 0; color: #e2f4f6; }
    .dashboard-hero a { background: white; color: #12334c; }
    .dashboard-hero button { background: #a4ebe4; color: #12334c; }
    .dashboard-metrics, .dashboard-detail, .context-grid { display: grid; gap: 1rem; margin-block-start: 1rem; }
    .dashboard-metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .dashboard-metric, .context-card {
      background: white; border: 1px solid #dce6ec; border-radius: .8rem; padding: 1rem;
      color: #16324f; text-decoration: none;
    }
    .dashboard-metric { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .55rem; }
    .dashboard-metric strong { grid-column: 1; font-size: 1.65rem; }
    .dashboard-metric .metric-arrow { justify-self: end; }
    .dashboard-metric.high { border-top: 3px solid #b3363e; }
    .dashboard-metric.medium { border-top: 3px solid #b38125; }
    .dashboard-metric.neutral { border-top: 3px solid #087f8c; }
    .dashboard-metric:hover, .context-card:hover { background: #edf8f8; border-color: #087f8c; }
    .dashboard-metric:focus-visible, .context-card:focus-visible { outline: 3px solid #087f8c; outline-offset: 2px; }
    .dashboard-detail { grid-template-columns: minmax(0, 1.75fr) minmax(0, 1fr); align-items: start; }
    .dashboard-detail .section { min-width: 0; margin: 0; }
    .dashboard-detail .section-heading { flex-wrap: wrap; gap: .5rem; }
    .risk-filters { display: flex; gap: .25rem; flex-wrap: wrap; padding: .65rem 1rem; }
    .risk-filters .selected { background: #dbf0f0; color: #095361; }
    .dashboard-empty { padding: 1.25rem; }
    .dashboard-contexts { margin-block-start: 1.5rem; }
    .context-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .context-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: .7rem; align-items: center; }
    .context-card span { display: block; margin-top: .25rem; color: #52677b; font-size: .875rem; }
    @media (max-width: 1050px) {
      .dashboard-detail { grid-template-columns: 1fr; }
      .dashboard-metrics, .context-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 470px) {
      .context-grid { grid-template-columns: 1fr; }
      .dashboard-metric { padding: .65rem; font-size: .8rem; }
    }
  `],
})
export class Dashboard {
  private readonly iam = inject(IamStore);
  readonly userName = computed(() => this.iam.user()?.name ?? "");
  readonly vehicles = inject(VehicleStore);
  readonly reports = inject(ReportStore);
  readonly language = inject(LanguageStore);
  private readonly dialog = inject(MatDialog);
  readonly alerts = inject(AlertStore);
  readonly openAlerts = computed(
    () => this.alerts.items().filter((a) => a.status === "open").length,
  );
  readonly fleetLoading = computed(() => this.vehicles.loading() || this.reports.loading());
  readonly fleetError = computed(() => this.vehicles.error() || this.reports.error());
  readonly riskFilter = signal("all");
  readonly filters = [
    { value: "all", label: "common.all" },
    { value: "high", label: "risk.high" },
    { value: "medium", label: "risk.medium" },
    { value: "unknown", label: "risk.unknown" },
  ];
  readonly visibleVehicles = computed(() => this.vehicles.items().filter((vehicle) =>
    this.riskFilter() === "all" ||
    (this.reports.latest(vehicle.id)?.risk ?? "unknown") === this.riskFilter(),
  ).slice(0, 6));
  readonly metrics = computed(() => {
    const vehicles = this.vehicles.items();
    const hasVehicles = !this.vehicles.loading() && !this.vehicles.error();
    const hasRisks = !this.fleetLoading() && !this.fleetError();
    return [
      { label: "dashboard.total", icon: "truck", path: "/vehicles", tone: "neutral", value: hasVehicles ? vehicles.length : null },
      { label: "dashboard.critical", icon: "alert-triangle", path: "/vehicles", params: { risk: "high" }, tone: "high",
        value: hasRisks ? vehicles.filter((vehicle) => this.reports.latest(vehicle.id)?.risk === "high").length : null },
      { label: "dashboard.mediumRisk", icon: "clock", path: "/vehicles", params: { risk: "medium" }, tone: "medium",
        value: hasRisks ? vehicles.filter((vehicle) => this.reports.latest(vehicle.id)?.risk === "medium").length : null },
      { label: "dashboard.alerts", icon: "bell", path: "/alerts", tone: "neutral",
        value: this.alerts.loading() || this.alerts.error() ? null : this.openAlerts() },
    ];
  });
  readonly contexts = [
    { path: "/profile", icon: "user", label: "nav.profile", action: "dashboard.accountAction" },
    { path: "/subscription", icon: "file-text", label: "nav.subscription", action: "dashboard.planAction" },
    { path: "/vehicles", icon: "search", label: "dashboard.vehicleInformation", action: "dashboard.vehicleAction" },
    { path: "/cases", icon: "clipboard-check", label: "nav.fleet", action: "dashboard.fleetAction" },
    { path: "/reports", icon: "file-text", label: "nav.reports", action: "dashboard.reportAction" },
    { path: "/monitoring", icon: "history", label: "nav.monitoring", action: "dashboard.monitorAction" },
  ];
  readonly recent = computed(() =>
    [...this.reports.items()]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3),
  );
  constructor() {
    void this.load();
  }
  async load(): Promise<void> {
    await Promise.all([
      this.vehicles.loadForUser(),
      this.reports.loadForUser(),
      this.alerts.loadForUser(),
    ]);
  }
  add(): void {
    this.dialog.open(VehicleDialog, {
      data: null,
      width: "580px",
      maxWidth: "95vw",
    });
  }
}
