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
      <div class="section-heading">
        <h2>{{ "report.history" | translate }}</h2>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>{{ "report.filterPlate" | translate }}</mat-label>
          <input matInput [ngModel]="historyPlate()" (ngModelChange)="filterHistory($event)" />
        </mat-form-field>
      </div>
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
                <th>{{ "vehicle.brand" | translate }} / {{ "vehicle.model" | translate }}</th>
                <th>{{ "report.snapshot" | translate }}</th>
                <th>{{ "common.date" | translate }}</th>
                <th>{{ "vehicle.risk" | translate }}</th>
                <th>{{ "common.status" | translate }}</th>
                <th>{{ "common.actions" | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (r of pageReports(); track r.id) {
                <tr>
                  <td class="plate">{{ r.plate }}</td>
                  <td>{{ vehicleNames().get(r.vehicleId) ?? "—" }}</td>
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
        <nav class="report-pagination" [attr.aria-label]="'report.pagination' | translate">
          <span aria-live="polite">{{ "report.pageRange" | translate: {
            start: pageStart() + 1, end: pageStart() + pageReports().length, total: sorted().length
          } }}</span>
          <div class="page-buttons">
            <button mat-icon-button type="button" [disabled]="page() === 1"
              [attr.aria-label]="'report.previousPage' | translate" (click)="selectedPage.set(page() - 1)">
              <lucide-icon name="arrow-left" size="16" />
            </button>
            @for (number of pageNumbers(); track number) {
              <button mat-stroked-button type="button" [class.current]="page() === number"
                [attr.aria-current]="page() === number ? 'page' : null"
                [attr.aria-label]="'report.pageNumber' | translate: { number }"
                (click)="selectedPage.set(number)">{{ number }}</button>
            }
            <button mat-icon-button type="button" [disabled]="page() === pageCount()"
              [attr.aria-label]="'report.nextPage' | translate" (click)="selectedPage.set(page() + 1)">
              <lucide-icon name="arrow-right" size="16" />
            </button>
          </div>
        </nav>
      }
    </section>`,
  styles: [`
    .report-pagination { display: flex; align-items: center; justify-content: space-between;
      gap: .75rem; padding: .75rem 1rem; flex-wrap: wrap; border-top: 1px solid #dce6ec; }
    .page-buttons { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem; }
    .page-buttons button[mat-stroked-button] { min-width: 2.25rem; padding-inline: .5rem; }
    .page-buttons .current { background: #dbf0f0; color: #095361; }
  `],
})
export class ReportsView {
  readonly store = inject(ReportStore);
  readonly vehicles = inject(VehicleStore);
  readonly language = inject(LanguageStore);
  private readonly iam = inject(IamStore);
  private readonly router = inject(Router);
  plate = "";
  readonly queryError = signal<string | null>(null);
  readonly historyPlate = signal("");
  readonly sorted = computed(() =>
    this.store.items().filter((report) =>
      report.plate.toUpperCase().includes(this.historyPlate().trim().toUpperCase()),
    ).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
    ),
  );
  readonly pageSize = 10;
  readonly selectedPage = signal(1);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.sorted().length / this.pageSize)));
  readonly page = computed(() => Math.min(this.selectedPage(), this.pageCount()));
  readonly pageNumbers = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index + 1));
  readonly pageStart = computed(() => (this.page() - 1) * this.pageSize);
  readonly pageReports = computed(() => this.sorted().slice(this.pageStart(), this.pageStart() + this.pageSize));
  readonly vehicleNames = computed(() => new Map(
    this.vehicles.items().map((vehicle) => [vehicle.id, `${vehicle.brand} ${vehicle.model}`]),
  ));

  filterHistory(value: string): void {
    this.historyPlate.set(value);
    this.selectedPage.set(1);
  }

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
