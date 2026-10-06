import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { RiskBadge } from "../../../shared/presentation/components/risk-badge";
import { LanguageStore } from "../../../shared/application/language.store";
import { VehicleStore } from "../../application/vehicle.store";
import { ReportStore } from "../../../report-management/application/report.store";
import { VehicleDialog } from "../components/vehicle-dialog";
@Component({
  imports: [...UI_IMPORTS, RouterLink, StateMessage, RiskBadge],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <a mat-button routerLink="/vehicles"
      ><lucide-icon name="arrow-left" size="16" />{{
        "common.back" | translate
      }}</a
    >
    <app-state-message
      [loading]="store.loading() || reports.loading()"
      [error]="store.error() || reports.error()"
      (retry)="load()"
    />
    @if (vehicle(); as v) {
      <div class="page-heading">
        <div>
          <h1>{{ v.plate }}</h1>
          <p>{{ v.brand }} {{ v.model }} · {{ v.year }}</p>
        </div>
        <div class="actions">
          <app-risk-badge
            [risk]="reports.latest(v.id)?.risk || 'unknown'"
          /><button mat-stroked-button (click)="edit()">
            {{ "vehicle.edit" | translate }}</button
          ><button
            mat-flat-button
            (click)="generate()"
            [disabled]="reports.generating()"
          >
            <lucide-icon name="file-text" size="17" />{{
              (reports.generating() ? "common.loading" : "vehicle.newReport")
                | translate
            }}
          </button>
        </div>
      </div>
      <div class="notice">{{ "common.simulated" | translate }}</div>
      <section class="section">
        <div class="section-body">
          <dl class="detail-grid">
            <div>
              <dt>{{ "common.responsible" | translate }}</dt>
              <dd>{{ v.responsible || ("common.unassigned" | translate) }}</dd>
            </div>
            <div>
              <dt>{{ "vehicle.owner" | translate }}</dt>
              <dd>{{ v.owner || ("common.unknown" | translate) }}</dd>
            </div>
            <div>
              <dt>{{ "vehicle.vin" | translate }}</dt>
              <dd>{{ v.vin || ("common.unknown" | translate) }}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section class="section" style="margin-top:20px">
        <div class="section-heading">
          <h2>{{ "vehicle.history" | translate }}</h2>
        </div>
        @for (r of history(); track r.id) {
          <a class="row-link" [routerLink]="['/reports', r.id]"
            ><div>
              <strong
                >{{ "report.snapshot" | translate }} {{ r.version }}</strong
              ><span class="secondary">{{ language.date(r.createdAt) }}</span>
            </div>
            <app-risk-badge [risk]="r.risk" /><lucide-icon
              name="chevron-right"
              size="17"
          /></a>
        }
        @if (!history().length && !reports.loading()) {
          <div class="state">{{ "vehicle.noHistory" | translate }}</div>
        }
      </section>
    } @else if (!store.loading() && !store.error()) {
      <p class="state">{{ "common.notFound" | translate }}</p>
    }`,
})
export class VehicleDetail {
  readonly store = inject(VehicleStore);
  readonly reports = inject(ReportStore);
  readonly language = inject(LanguageStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly id = signal(0);
  readonly vehicle = computed(() =>
    this.store.items().find((v) => v.id === this.id()),
  );
  readonly history = computed(() => this.reports.forVehicle(this.id()));
  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((p) => this.id.set(Number(p.get("id"))));
    void this.load();
  }
  async load(): Promise<void> {
    await Promise.all([this.store.loadForUser(), this.reports.loadForUser()]);
  }
  edit(): void {
    this.dialog.open(VehicleDialog, {
      data: this.vehicle(),
      width: "580px",
      maxWidth: "95vw",
    });
  }
  async generate(): Promise<void> {
    const v = this.vehicle();
    if (!v) return;
    const r = await this.reports.generate(v);
    if (r) await this.router.navigate(["/reports", r.id]);
  }
}
