import { ActivatedRoute } from "@angular/router";
import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { VehicleStore } from "../../application/vehicle.store";
import { ReportStore } from "../../../report-management/application/report.store";
import { VehicleTable } from "../components/vehicle-table";
import { VehicleDialog } from "../components/vehicle-dialog";
@Component({
  imports: [...UI_IMPORTS, FormsModule, StateMessage, VehicleTable],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="page-heading">
      <div>
        <h1>{{ "vehicle.myVehicles" | translate }}</h1>
        <p>{{ "vehicle.myVehiclesSubtitle" | translate }}</p>
      </div>
      <div class="actions">
        <button mat-flat-button (click)="add()">
          <lucide-icon name="plus" size="17" />{{ "vehicle.add" | translate }}
        </button>
      </div>
    </div>
    <div class="toolbar">
      <mat-form-field appearance="outline"
        ><mat-label>{{ "common.search" | translate }}</mat-label
        ><input
          matInput
          [ngModel]="search()"
          (ngModelChange)="search.set($event)" /><lucide-icon
          matPrefix
          name="search"
          size="18"
      /></mat-form-field>
      <mat-form-field appearance="outline"
        ><mat-label>{{ "vehicle.risk" | translate }}</mat-label
        ><mat-select [ngModel]="risk()" (ngModelChange)="risk.set($event)"
          ><mat-option value="all">{{ "common.all" | translate }}</mat-option>
          @for (r of risks; track r) {
            <mat-option [value]="r">{{ "risk." + r | translate }}</mat-option>
          }
        </mat-select></mat-form-field
      >
      @if (search() || risk() !== "all") {
        <button mat-button (click)="search.set(''); risk.set('all')">
          {{ "vehicle.resetFilters" | translate }}
        </button>
      }
      <span class="count"
        >{{ filtered().length }} {{ "common.vehicles" | translate }}</span
      >
    </div>
    <section class="section">
      <app-state-message
        [loading]="store.loading() || reports.loading()"
        [error]="store.error() || reports.error()"
        [empty]="!filtered().length"
        (retry)="load()"
      />
      @if (
        !store.loading() &&
        !reports.loading() &&
        !store.error() &&
        !reports.error() &&
        filtered().length
      ) {
        <app-vehicle-table
          [vehicles]="filtered()"
          [reports]="reports.items()"
        />
      }
    </section>`,
})
export class VehiclesView {
  readonly store = inject(VehicleStore);
  readonly reports = inject(ReportStore);
  private readonly dialog = inject(MatDialog);
  readonly search = signal("");
  private readonly route = inject(ActivatedRoute);
  readonly risk = signal(this.route.snapshot.queryParamMap.get("risk") ?? "all");
  readonly risks = ["high", "medium", "low", "unknown"];
  readonly filtered = computed(() =>
    this.store
      .items()
      .filter(
        (v) =>
          [v.plate, v.brand, v.model, v.responsible]
            .join(" ")
            .toLowerCase()
            .includes(this.search().toLowerCase()) &&
          (this.risk() === "all" ||
            (this.reports.latest(v.id)?.risk || "unknown") === this.risk()),
      ),
  );
  constructor() {
    if (this.risk() !== "all" && !this.risks.includes(this.risk())) this.risk.set("all");
    void this.load();
  }
  async load(): Promise<void> {
    await Promise.all([
      this.store.loadForUser(),
      this.reports.loadForUser(),
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
