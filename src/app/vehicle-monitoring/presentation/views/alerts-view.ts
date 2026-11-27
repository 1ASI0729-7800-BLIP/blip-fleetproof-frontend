import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { LanguageStore } from "../../../shared/application/language.store";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { AlertStore } from "../../application/alert.store";
import { TelemetryApi, TelemetryReadingData } from "../../../vehicle-telemetry/infrastructure/telemetry-api";
@Component({
  imports: [...UI_IMPORTS, FormsModule, RouterLink, StateMessage],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="page-heading">
      <div>
        <h1>{{ "nav.alerts" | translate }}</h1>
        <p>{{ "alerts.subtitle" | translate }}</p>
      </div>
    </div>
    <div class="toolbar">
      <mat-form-field appearance="outline"
        ><mat-label>{{ "common.status" | translate }}</mat-label
        ><mat-select [ngModel]="filter()" (ngModelChange)="filter.set($event)"
          ><mat-option value="all">{{ "common.all" | translate }}</mat-option
          ><mat-option value="open">{{ "alerts.open" | translate }}</mat-option
          ><mat-option value="reviewed">{{
            "alerts.reviewed" | translate
          }}</mat-option></mat-select
        ></mat-form-field
      >
    </div>
    <section class="section">
      <app-state-message
        [loading]="store.loading()"
        [error]="store.error()"
        [empty]="!filtered().length"
        (retry)="load()"
      />
      @for (a of filtered(); track a.id) {
        <div class="source-row">
          <lucide-icon
            [name]="a.type === 'telemetry' ? 'activity' : (a.type === 'technical' ? 'alert-triangle' : 'bell')"
            size="21"
            [style.color]="a.type === 'telemetry' ? '#b3363e' : (a.type === 'technical' ? '#b38125' : '#087f8c')"
          />
          <div style="flex:1">
            <h3>
              {{ plate(a.vehicleId) }} · {{ "alerts." + a.type | translate }}
            </h3>
            <p>{{ a.messageKey | translate }}</p>
            @if (telemetryFor(a.id); as reading) {
              <div class="telemetry-detail">
                <span>{{ reading.risks.join(" · ").replaceAll("_", " ") }}</span>
                <span>{{ "telemetry.temperature" | translate }}: <b>{{ reading.engineTemperatureCelsius }} °C</b> ({{ reading.minimumTemperatureThreshold }}–{{ reading.maximumTemperatureThreshold }})</span>
                <span>{{ "telemetry.speed" | translate }}: <b>{{ reading.gpsSpeedKph }} km/h</b> (max {{ reading.maximumSpeedThreshold }})</span>
                <span>{{ "telemetry.battery" | translate }}: <b>{{ reading.vehicleBatteryVoltage }} V</b> (min {{ reading.minimumBatteryThreshold }})</span>
                <span>{{ "telemetry.critical" | translate }}</span>
              </div>
            }
            <p>{{ language.date(a.createdAt) }}</p>
            <span
              [class]="
                'badge status-' + (a.status === 'open' ? 'open' : 'complete')
              "
              >{{ "alerts." + a.status | translate }}</span
            >
          </div>
          <div class="actions">
            @if (a.reportId) {
              <a mat-stroked-button [routerLink]="['/reports', a.reportId]">{{ "common.view" | translate }}</a>
            } @else {
              <a mat-stroked-button routerLink="/telemetry">{{ "telemetry.viewTelemetry" | translate }}</a>
            }
            @if (a.status === "open") {
              <button
                mat-button
                (click)="store.acknowledge(a)"
                [disabled]="store.saving()"
              >
                {{ "alerts.acknowledge" | translate }}
              </button>
            }
          </div>
        </div>
      }
    </section>`,
})
export class AlertsView {
  readonly store = inject(AlertStore);
  readonly vehicles = inject(VehicleStore);
  readonly language = inject(LanguageStore);
  readonly filter = signal("all");
  private readonly telemetryApi = inject(TelemetryApi);
  readonly telemetry = signal<TelemetryReadingData[]>([]);
  readonly filtered = computed(() =>
    [...this.store.items()]
      .filter((a) => this.filter() === "all" || a.status === this.filter())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  constructor() {
    void this.load();
  }
  async load(): Promise<void> {
    await Promise.all([this.store.loadForUser(), this.vehicles.loadForUser()]);
    try { this.telemetry.set(await this.telemetryApi.list(undefined, 200)); }
    catch { this.telemetry.set([]); }
  }
  plate(id: number): string {
    return this.vehicles.items().find((v) => v.id === id)?.plate || "—";
  }
  telemetryFor(alertId: number): TelemetryReadingData | undefined {
    return this.telemetry().find((reading) => reading.alertId === alertId);
  }
}
