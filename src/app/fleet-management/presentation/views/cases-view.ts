import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { CaseStore } from "../../application/fleet.store";
import { ResolutionCase } from "../../domain/model/fleet.entity";
import { CaseDialog } from "../components/case-dialog";
@Component({
  imports: [...UI_IMPORTS, FormsModule, RouterLink, StateMessage],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="page-heading">
      <div>
        <h1>{{ "nav.cases" | translate }}</h1>
        <p>{{ "cases.subtitle" | translate }}</p>
      </div>
      <button mat-flat-button (click)="open()">
        <lucide-icon name="plus" size="17" />{{ "cases.create" | translate }}
      </button>
    </div>
    <div class="notice">{{ "cases.noRiskChange" | translate }}</div>
    <div class="toolbar">
      <mat-form-field appearance="outline"
        ><mat-label>{{ "common.status" | translate }}</mat-label
        ><mat-select [ngModel]="filter()" (ngModelChange)="filter.set($event)"
          ><mat-option value="all">{{ "common.all" | translate }}</mat-option>
          @for (s of statuses; track s) {
            <mat-option [value]="s">{{ "cases." + s | translate }}</mat-option>
          }
        </mat-select></mat-form-field
      >
    </div>
    <section class="section">
      <app-state-message
        [loading]="store.loading()"
        [error]="store.error()"
        [empty]="!filtered().length"
        (retry)="load()"
      />
      @for (c of filtered(); track c.id) {
        <div class="source-row">
          <div style="flex:1">
            <h3>{{ c.title }}</h3>
            <p>
              {{ plate(c.vehicleId) }} · {{ "common.responsible" | translate }}:
              {{ c.responsible }}
            </p>
            @if (c.dueDate) {
              <p>{{ "cases.due" | translate }}: {{ due(c.dueDate) }}</p>
            }
            @if (c.evidence) {
              <p>{{ "common.evidence" | translate }}: {{ c.evidence }}</p>
            }
            @if (c.notes) {
              <p>{{ c.notes }}</p>
            }
            <span [class]="'badge status-' + c.status">{{
              "cases." + c.status | translate
            }}</span>
          </div>
          <div class="actions">
            @if (c.reportId) {
              <a mat-stroked-button [routerLink]="['/reports', c.reportId]">{{
                "common.view" | translate
              }}</a>
            }
            <button mat-button (click)="open(c)">
              {{ "cases.resolve" | translate }}
            </button>
          </div>
        </div>
      }
    </section>`,
})
export class CasesView {
  readonly store = inject(CaseStore);
  readonly vehicles = inject(VehicleStore);
  private readonly dialog = inject(MatDialog);
  readonly filter = signal("all");
  readonly statuses = ["open", "in-progress", "resolved"];
  readonly filtered = computed(() =>
    this.store
      .items()
      .filter((c) => this.filter() === "all" || c.status === this.filter()),
  );
  constructor() {
    void this.load();
  }
  async load(): Promise<void> {
    await Promise.all([this.store.loadForUser(), this.vehicles.loadForUser()]);
  }
  plate(id: number): string {
    return this.vehicles.items().find((v) => v.id === id)?.plate || "—";
  }
  due(value: string): string {
    return new Intl.DateTimeFormat(
      document.documentElement.lang === "en" ? "en-US" : "es-PE",
      { dateStyle: "medium", timeZone: "UTC" },
    ).format(new Date(value + "T00:00:00Z"));
  }
  open(item?: ResolutionCase): void {
    this.dialog.open(CaseDialog, {
      data: { item },
      width: "580px",
      maxWidth: "95vw",
    });
  }
}
