import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { RouterLink } from "@angular/router";
import { ReportStore } from "../../../report-management/application/report.store";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { VehicleTable } from "../../../vehicle-information/presentation/components/vehicle-table";
import { FleetStore } from "../../application/fleet.store";
import { CsvDialog } from "../components/csv-dialog";
import { FleetDialog } from "../components/fleet-dialog";

@Component({
  imports: [...UI_IMPORTS, RouterLink, StateMessage, VehicleTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-heading">
      <div>
        <h1>{{ "nav.fleet" | translate }}</h1>
        <p>{{ "nav.fleetDescription" | translate }}</p>
      </div>
      <div class="actions">
        <a mat-stroked-button routerLink="/cases">{{ "nav.cases" | translate }}</a>
        <button mat-stroked-button type="button" (click)="importCsv()"
          [disabled]="loading() || !!error()">{{ "vehicle.import" | translate }}</button>
        <button mat-flat-button type="button" (click)="createFleet()">{{ "vehicle.createFleet" | translate }}</button>
      </div>
    </header>
    <app-state-message [loading]="loading()" [error]="error()" (retry)="load()" />
    @if (!loading() && !error()) {
      <section class="section">
        <div class="section-heading">
          <h2>{{ "vehicle.fleet" | translate }}</h2>
          <a mat-button routerLink="/vehicles">{{ "nav.myVehicles" | translate }}</a>
        </div>
        <div class="section-body">
          @if (!fleets.items().length) {
            <p>{{ "nav.firstFleet" | translate }}</p>
          }
          <div class="actions" role="group" [attr.aria-label]="'vehicle.fleet' | translate">
            <button mat-stroked-button type="button" [attr.aria-pressed]="selectedFleet() === -1"
              (click)="selectedFleet.set(-1)">{{ "common.all" | translate }}</button>
            @for (fleet of fleets.items(); track fleet.id) {
              <button mat-stroked-button type="button" [attr.aria-pressed]="selectedFleet() === fleet.id"
                (click)="selectedFleet.set(fleet.id)">{{ fleet.name }} · {{ counts().get(fleet.id) ?? 0 }}</button>
            }
            <button mat-stroked-button type="button" [attr.aria-pressed]="selectedFleet() === 0"
              (click)="selectedFleet.set(0)">{{ "common.unassigned" | translate }} · {{ counts().get(0) ?? 0 }}</button>
          </div>
        </div>
        @if (visibleVehicles().length) {
          <app-vehicle-table [vehicles]="visibleVehicles()" [reports]="reports.items()" />
        } @else {
          <app-state-message [empty]="true" />
        }
      </section>
    }
  `,
  styles: [`
    button[aria-pressed="true"] { background: #dbf0f0; color: #095361; }
  `],
})
export class FleetsView {
  readonly fleets = inject(FleetStore);
  readonly vehicles = inject(VehicleStore);
  readonly reports = inject(ReportStore);
  private readonly dialog = inject(MatDialog);
  readonly selectedFleet = signal(-1);
  readonly loading = computed(() => this.fleets.loading() || this.vehicles.loading() || this.reports.loading());
  readonly error = computed(() => this.fleets.error() || this.vehicles.error() || this.reports.error());
  readonly visibleVehicles = computed(() => this.vehicles.items().filter((vehicle) =>
    this.selectedFleet() === -1 || this.selectedFleet() === vehicle.fleetId,
  ));
  readonly counts = computed(() => {
    const counts = new Map<number, number>();
    for (const vehicle of this.vehicles.items()) {
      counts.set(vehicle.fleetId, (counts.get(vehicle.fleetId) ?? 0) + 1);
    }
    return counts;
  });

  constructor() {
    void this.load();
  }

  async load(): Promise<void> {
    await Promise.all([this.fleets.loadForUser(), this.vehicles.loadForUser(), this.reports.loadForUser()]);
  }

  createFleet(): void {
    this.dialog.open(FleetDialog, { width: "440px", maxWidth: "95vw" });
  }

  importCsv(): void {
    this.dialog.open(CsvDialog, { width: "580px", maxWidth: "95vw" });
  }
}
