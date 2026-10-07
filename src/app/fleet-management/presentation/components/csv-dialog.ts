import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { FleetStore } from "../../application/fleet.store";
import { CsvImportService } from "../../application/csv-import.service";
import { ImportRow } from "../../domain/model/csv-import";
import { validateCsv } from "../../infrastructure/csv-parser";
@Component({
  imports: [...UI_IMPORTS, FormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <h2 mat-dialog-title>{{ "vehicle.importTitle" | translate }}</h2>
    <mat-dialog-content
      ><div class="dialog-body">
        <p>{{ "vehicle.importHint" | translate }}</p>
        <a href="/assets/vehicles-template.csv" download>{{
          "vehicle.importTemplate" | translate
        }}</a>
        <mat-form-field appearance="outline" style="width:100%;margin-top:16px"
          ><mat-label>{{ "vehicle.fleet" | translate }}</mat-label
          ><mat-select [(ngModel)]="fleetId" [disabled]="busy()"
            ><mat-option [value]="0">{{
              "common.unassigned" | translate
            }}</mat-option>
            @for (f of fleets.items(); track f.id) {
              <mat-option [value]="f.id">{{ f.name }}</mat-option>
            }
          </mat-select></mat-form-field
        >
        <label style="display:block;margin-bottom:8px" for="csv-file">{{
          "vehicle.file" | translate
        }}</label
        ><input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          (change)="read($event)"
          [disabled]="busy()"
        />
        @if (rows().length) {
          <p>{{ "vehicle.rows" | translate }}: {{ rows().length }}</p>
        }
        @if (error()) {
          <p class="error" role="alert">
            {{ error()! | translate: { count: imported() } }}
            @if (invalidRows().length) {
              {{ "vehicle.rows" | translate }}: {{ invalidRows().join(", ") }}
            }
          </p>
        }
        @if (complete()) {
          <p class="success-text" role="status">
            {{ "vehicle.importSuccess" | translate: { count: imported() } }}
          </p>
        }
      </div></mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button (click)="ref.close()" [disabled]="busy()">
        {{
          (complete() ? "common.close" : "common.cancel") | translate
        }}</button
      ><button
        mat-flat-button
        (click)="import()"
        [disabled]="busy() || !rows().length || complete()"
      >
        {{ (busy() ? "common.loading" : "vehicle.import") | translate }}
      </button></mat-dialog-actions
    >`,
})
export class CsvDialog {
  readonly vehicles = inject(VehicleStore);
  readonly fleets = inject(FleetStore);
  private readonly service = inject(CsvImportService);
  readonly ref = inject(MatDialogRef<CsvDialog>);
  readonly rows = signal<ImportRow[]>([]);
  readonly error = signal<string | null>(null);
  readonly invalidRows = signal<number[]>([]);
  readonly busy = signal(false);
  readonly complete = signal(false);
  readonly imported = signal(0);
  fleetId = 0;
  constructor() {
    void this.fleets.loadForUser();
  }
  async read(event: Event): Promise<void> {
    this.rows.set([]);
    this.error.set(null);
    this.invalidRows.set([]);
    this.complete.set(false);
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 100000 || !file.name.toLowerCase().endsWith(".csv")) {
      this.error.set("vehicle.importInvalid");
      return;
    }
    const result = validateCsv(
      await file.text(),
      this.vehicles.items(),
      new Date().getFullYear(),
    );
    this.rows.set(result.rows);
    this.error.set(result.error);
    this.invalidRows.set(result.invalidRows);
  }
  async import(): Promise<void> {
    if (this.busy() || !this.rows().length || this.complete()) return;
    this.busy.set(true);
    this.ref.disableClose = true;
    try {
      await this.vehicles.loadForUser();
      if (this.vehicles.error()) {
        this.error.set(this.vehicles.error());
        return;
      }
      if (this.vehicles.items().length + this.rows().length > 25) {
        this.error.set("vehicle.quota");
        return;
      }
      const result = await this.service.import(this.rows(), this.fleetId);
      this.imported.set(result.count);
      this.complete.set(result.complete);
      if (!result.complete) {
        this.error.set("vehicle.partialImport");
        this.rows.set([]);
      }
    } finally {
      this.busy.set(false);
      this.ref.disableClose = false;
    }
  }
}
