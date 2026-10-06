import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { RiskBadge } from "../../../shared/presentation/components/risk-badge";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { LanguageStore } from "../../../shared/application/language.store";
import { IamStore } from "../../../iam/application/iam.store";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import {
  Vehicle,
  isValidPlate,
  normalizePlate,
} from "../../../vehicle-information/domain/model/vehicle.entity";
import { ReportStore } from "../../application/report.store";
@Component({
  imports: [...UI_IMPORTS, FormsModule, RouterLink, RiskBadge, StateMessage],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="page-heading">
      <div>
        <h1>{{ "report.title" | translate }}</h1>
        <p>{{ "report.subtitle" | translate }}</p>
      </div>
    </div>
    <div class="notice">{{ "common.simulated" | translate }}</div>
    <form class="inline-form" (ngSubmit)="query()">
      <mat-form-field appearance="outline"
        ><mat-label>{{ "vehicle.plate" | translate }}</mat-label
        ><input
          matInput
          name="plate"
          [(ngModel)]="plate"
          maxlength="7" /></mat-form-field
      ><button
        mat-flat-button
        style="margin-top:6px"
        [disabled]="
          store.generating() || vehicles.saving() || vehicles.loading()
        "
      >
        <lucide-icon name="search" size="17" />{{
          "report.queryAction" | translate
        }}
      </button>
    </form>
    @if (queryError()) {
      <p class="error" role="alert">{{ queryError()! | translate }}</p>
    }
    <section class="section">
      <app-state-message
        [loading]="store.loading()"
        [error]="store.error()"
        [empty]="!sorted().length"
        (retry)="load()"
      />
      @if (!store.loading() && !store.error() && sorted().length) {
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{{ "vehicle.plate" | translate }}</th>
                <th>{{ "report.snapshot" | translate }}</th>
                <th>{{ "common.date" | translate }}</th>
                <th>{{ "vehicle.risk" | translate }}</th>
                <th>{{ "common.status" | translate }}</th>
                <th>{{ "common.actions" | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (r of sorted(); track r.id) {
                <tr>
                  <td class="plate">{{ r.plate }}</td>
                  <td>v{{ r.version }}</td>
                  <td>{{ language.date(r.createdAt) }}</td>
                  <td><app-risk-badge [risk]="r.risk" /></td>
                  <td>
                    <span
                      [class]="
                        'badge status-' + (r.complete ? 'complete' : 'partial')
                      "
                      >{{
                        (r.complete ? "report.complete" : "report.partial")
                          | translate
                      }}</span
                    >
                  </td>
                  <td>
                    <a
                      mat-icon-button
                      [routerLink]="['/reports', r.id]"
                      [attr.aria-label]="'common.view' | translate"
                      [matTooltip]="'common.view' | translate"
                      ><lucide-icon name="arrow-right" size="18"
                    /></a>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>`,
})
export class ReportsView {
  readonly store = inject(ReportStore);
  readonly vehicles = inject(VehicleStore);
  readonly language = inject(LanguageStore);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);
  plate = "";
  readonly queryError = signal<string | null>(null);
  readonly sorted = computed(() =>
    [...this.store.items()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
  );
  constructor() {
    void this.load();
  }
  async load(): Promise<void> {
    await Promise.all([this.store.loadForUser(), this.vehicles.loadForUser()]);
  }
  async query(): Promise<void> {
    this.queryError.set(null);
    if (!isValidPlate(this.plate)) {
      this.queryError.set("vehicle.plateError");
      return;
    }
    if (this.vehicles.error()) {
      this.queryError.set(this.vehicles.error());
      return;
    }
    const plate = normalizePlate(this.plate);
    let vehicle = this.vehicles.items().find((v) => v.plate === plate);
    if (!vehicle) {
      const saved = await this.vehicles.save(
        new Vehicle(0, this.iam.user()!.id, 0, plate, "—", "—", 2026, ""),
      );
      if (!saved) {
        this.queryError.set(this.vehicles.error());
        return;
      }
      vehicle = saved;
    }
    const report = await this.store.generate(vehicle);
    if (report) await this.router.navigate(["/reports", report.id]);
  }
}
