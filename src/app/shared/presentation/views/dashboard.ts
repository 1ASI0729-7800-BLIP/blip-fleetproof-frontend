import {
  Component,
  computed,
  inject,
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
import { AlertStore } from "../../../vehicle-monitoring/application/alert.store";
@Component({
  imports: [...UI_IMPORTS, RouterLink, StateMessage, VehicleTable, RiskBadge],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="page-heading">
      <div>
        <h1>{{ "nav.dashboard" | translate }}</h1>
        <p>{{ "dashboard.subtitle" | translate }}</p>
      </div>
      <div class="actions">
        <a mat-stroked-button routerLink="/reports"
          ><lucide-icon name="search" size="17" />{{
            "dashboard.quickQuery" | translate
          }}</a
        ><button mat-flat-button (click)="add()">
          <lucide-icon name="plus" size="17" />{{ "vehicle.add" | translate }}
        </button>
      </div>
    </div>
    <div class="metrics">
      <div class="metric">
        <div class="metric-label">
          {{ "dashboard.total" | translate
          }}<lucide-icon name="truck" size="19" />
        </div>
        <strong>{{ vehicles.items().length }}</strong
        ><small>{{ "common.demo" | translate }}</small>
      </div>
      <div class="metric">
        <div class="metric-label">
          {{ "dashboard.critical" | translate
          }}<lucide-icon name="alert-triangle" size="19" />
        </div>
        <strong>{{ critical() }}</strong
        ><small>{{ "report.riskExplanation" | translate }}</small>
      </div>
      <div class="metric">
        <div class="metric-label">
          {{ "dashboard.observation" | translate
          }}<lucide-icon name="clock" size="19" />
        </div>
        <strong>{{ observation() }}</strong
        ><small>{{ "vehicle.risk" | translate }}</small>
      </div>
      <div class="metric">
        <div class="metric-label">
          {{ "dashboard.alerts" | translate
          }}<lucide-icon name="bell" size="19" />
        </div>
        <strong>{{ openAlerts() }}</strong
        ><small>{{ "alerts.open" | translate }}</small>
      </div>
    </div>
    <app-state-message
      [loading]="vehicles.loading() || reports.loading() || alerts.loading()"
      [error]="vehicles.error() || reports.error() || alerts.error()"
      (retry)="load()"
    />
    @if (
      !vehicles.loading() &&
      !reports.loading() &&
      !vehicles.error() &&
      !reports.error()
    ) {
      <section class="section">
        <div class="section-heading">
          <h2>{{ "dashboard.fleetTitle" | translate }}</h2>
          <a mat-button routerLink="/vehicles"
            >{{ "dashboard.viewAll" | translate
            }}<lucide-icon name="arrow-right" size="16"
          /></a>
        </div>
        <app-state-message
          [empty]="!vehicles.items().length"
        /><app-vehicle-table
          [vehicles]="vehicles.items().slice(0, 6)"
          [reports]="reports.items()"
        />
      </section>
      <section class="section" style="margin-top:24px">
        <div class="section-heading">
          <h2>{{ "dashboard.activity" | translate }}</h2>
          <a mat-button routerLink="/reports">{{
            "dashboard.viewAll" | translate
          }}</a>
        </div>
        @for (r of recent(); track r.id) {
          <a class="row-link" [routerLink]="['/reports', r.id]"
            ><div>
              <strong>{{ r.plate }}</strong
              ><span class="secondary"
                >{{ "report.snapshot" | translate }} {{ r.version }} ·
                {{ language.date(r.createdAt) }}</span
              >
            </div>
            <app-risk-badge [risk]="r.risk" /><lucide-icon
              name="chevron-right"
              size="17"
          /></a>
        }
        @if (!recent().length) {
          <app-state-message [empty]="true" />
        }
      </section>
    }
  `,
})
export class Dashboard {
  readonly vehicles = inject(VehicleStore);
  readonly reports = inject(ReportStore);
  readonly language = inject(LanguageStore);
  private readonly dialog = inject(MatDialog);
  readonly alerts = inject(AlertStore);
  readonly openAlerts = computed(
    () => this.alerts.items().filter((a) => a.status === "open").length,
  );
  readonly critical = computed(
    () =>
      this.vehicles
        .items()
        .filter((v) => this.reports.latest(v.id)?.risk === "high").length,
  );
  readonly observation = computed(
    () =>
      this.vehicles
        .items()
        .filter((v) => this.reports.latest(v.id)?.risk === "medium").length,
  );
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
