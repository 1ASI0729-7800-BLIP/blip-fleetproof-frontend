import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { TelemetryApi, TelemetryReadingData } from "../../infrastructure/telemetry-api";

@Component({
  imports: [...UI_IMPORTS, FormsModule, RouterLink, StateMessage],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="page-heading">
      <div>
        <h1>{{ "telemetry.title" | translate }}</h1>
        <p>{{ "telemetry.subtitle" | translate }}</p>
      </div>
      <div class="live-state" [class.online]="autoRefresh()">
        <span></span>{{ (autoRefresh() ? "telemetry.live" : "telemetry.paused") | translate }}
      </div>
      <a mat-flat-button routerLink="/iot-simulator"><lucide-icon name="activity" size="17" />{{ "telemetry.openSimulator" | translate }}</a>
    </div>

    <section class="process-flow" aria-label="Telemetry event flow">
      <div><b>1</b><span>{{ "telemetry.sense" | translate }}</span><small>IoT / celular</small></div>
      <lucide-icon name="arrow-right" />
      <div><b>2</b><span>{{ "telemetry.analyze" | translate }}</span><small>{{ "telemetry.rules" | translate }}</small></div>
      <lucide-icon name="arrow-right" />
      <div><b>3</b><span>{{ "telemetry.act" | translate }}</span><small>{{ "telemetry.alertCase" | translate }}</small></div>
      <lucide-icon name="arrow-right" />
      <div><b>4</b><span>{{ "telemetry.followUp" | translate }}</span><small>FleetProof</small></div>
    </section>

    <div class="toolbar">
      <mat-form-field appearance="outline">
        <mat-label>{{ "telemetry.vehicle" | translate }}</mat-label>
        <mat-select [ngModel]="selectedVehicleId()" (ngModelChange)="selectVehicle($event)">
          <mat-option [value]="0">{{ "common.all" | translate }}</mat-option>
          @for (vehicle of vehicles.items(); track vehicle.id) {
            <mat-option [value]="vehicle.id">{{ vehicle.plate }} · {{ vehicle.brand }} {{ vehicle.model }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <button mat-stroked-button (click)="toggleRefresh()">
        <lucide-icon [name]="autoRefresh() ? 'pause' : 'play'" size="17" />
        {{ (autoRefresh() ? "telemetry.pauseLive" : "telemetry.resumeLive") | translate }}
      </button>
      <button mat-flat-button (click)="load()" [disabled]="loading()">
        <lucide-icon name="refresh-cw" size="17" />{{ "common.refresh" | translate }}
      </button>
    </div>

    <app-state-message [loading]="loading() && !readings().length" [error]="error()" [empty]="!loading() && !error() && !readings().length" (retry)="load()" />

    @if (latest()) {
      <section class="latest" [class.critical]="readingState(latest()!) === 'critical'" [class.warning]="readingState(latest()!) === 'warning'" [class.disconnected]="readingState(latest()!) === 'disconnected'">
        <div class="latest-heading">
          <div>
            <span class="kicker">{{ "telemetry.latestReading" | translate }}</span>
            <h2>{{ plate(latest()!.vehicleId) }}</h2>
            <p>{{ latest()!.deviceId }} · {{ relativeTime(latest()!.recordedAt) }}</p>
          </div>
          <span class="risk-state">{{ ("telemetry." + readingState(latest()!)) | translate }}</span>
        </div>

        <div class="metric-grid">
          <div><lucide-icon name="gauge" /><span>{{ "telemetry.speed" | translate }}</span><strong>{{ latest()!.gpsSpeedKph }}</strong><small>km/h · max {{ latest()!.maximumSpeedThreshold }}</small></div>
          <div><lucide-icon name="thermometer" /><span>{{ "telemetry.temperature" | translate }}</span><strong>{{ latest()!.engineTemperatureCelsius }}</strong><small>°C · {{ latest()!.minimumTemperatureThreshold }}–{{ latest()!.maximumTemperatureThreshold }} · SIMULATED</small></div>
          <div><lucide-icon name="battery" /><span>{{ "telemetry.battery" | translate }}</span><strong>{{ latest()!.vehicleBatteryVoltage }}</strong><small>V · min {{ latest()!.minimumBatteryThreshold }} · SIMULATED</small></div>
          <div><lucide-icon name="activity" /><span>RPM</span><strong>{{ latest()!.engineRpm }}</strong><small>SIMULATED</small></div>
          <div><lucide-icon name="route" /><span>{{ "telemetry.distance" | translate }}</span><strong>{{ latest()!.sessionDistanceKm }}</strong><small>km</small></div>
          <div><lucide-icon name="move-3d" /><span>{{ "telemetry.acceleration" | translate }}</span><strong>{{ latest()!.accelerationMagnitude }}</strong><small>m/s²</small></div>
        </div>

        @if (latest()!.risks.length) {
          <div class="risks">
            @for (risk of latest()!.risks; track risk) { <span>{{ riskLabel(risk) }}</span> }
          </div>
        }

        <div class="context-actions">
          @if (hasLocation(latest()!)) {
            <a mat-stroked-button [href]="mapUrl(latest()!)" target="_blank" rel="noopener">
              <lucide-icon name="map-pin" size="17" />{{ "telemetry.location" | translate }}
            </a>
          }
          @if (latest()!.alertId) {
            <a mat-stroked-button routerLink="/alerts"><lucide-icon name="bell" size="17" />{{ "telemetry.viewAlert" | translate }} #{{ latest()!.alertId }}</a>
          }
          @if (latest()!.resolutionCaseId) {
            <a mat-flat-button routerLink="/cases"><lucide-icon name="clipboard-check" size="17" />{{ "telemetry.viewCase" | translate }} #{{ latest()!.resolutionCaseId }}</a>
          }
        </div>
      </section>
    }

    @if (readings().length) {
      <section class="section history">
        <div class="section-heading"><h2>{{ "telemetry.history" | translate }}</h2><span>{{ readings().length }} {{ "telemetry.readings" | translate }}</span></div>
        <div class="table-scroll">
          <table>
            <thead><tr>
              <th>{{ "telemetry.time" | translate }}</th><th>{{ "telemetry.vehicle" | translate }}</th>
              <th>{{ "telemetry.speed" | translate }}</th><th>{{ "telemetry.temperature" | translate }}</th>
              <th>{{ "telemetry.battery" | translate }}</th><th>{{ "common.status" | translate }}</th>
            </tr></thead>
            <tbody>
              @for (reading of readings(); track reading.id) {
                <tr [class.critical-row]="reading.critical">
                  <td>{{ dateTime(reading.recordedAt) }}</td><td><a class="plate" [routerLink]="['/vehicles', reading.vehicleId]">{{ plate(reading.vehicleId) }}</a></td>
                  <td>{{ reading.gpsSpeedKph }} km/h</td><td>{{ reading.engineTemperatureCelsius }} °C</td>
                  <td>{{ reading.vehicleBatteryVoltage }} V</td>
                  <td><span [class]="'badge status-' + (readingState(reading) === 'critical' ? 'open' : 'complete')">{{ ("telemetry." + readingState(reading)) | translate }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    }
  `,
  styles: [`
    :host { display:block; }
    .live-state { display:flex; align-items:center; gap:.5rem; border:1px solid #dce6ec; border-radius:999px; padding:.5rem .8rem; font-size:.76rem; font-weight:700; color:#52677b; }
    .live-state span { width:.55rem; height:.55rem; background:#8da0ae; border-radius:50%; }
    .live-state.online span { background:#0b9a72; box-shadow:0 0 0 .3rem rgba(11,154,114,.12); }
    .process-flow { display:grid; grid-template-columns:1fr auto 1fr auto 1fr auto 1fr; gap:.75rem; align-items:center; background:#12334c; color:white; border-radius:1rem; padding:1rem; margin-bottom:1rem; }
    .process-flow div { display:grid; grid-template-columns:auto 1fr; gap:.15rem .55rem; align-items:center; }
    .process-flow b { grid-row:1/3; display:grid; place-items:center; width:2rem; height:2rem; background:#a4ebe4; color:#12334c; border-radius:.55rem; }
    .process-flow span { font-weight:800; }.process-flow small { color:#c9dde8; }
    .toolbar { display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }.toolbar mat-form-field { min-width:260px; flex:1; }
    .latest { border:1px solid #b8dfd9; border-top:4px solid #0b9a72; border-radius:1rem; background:white; padding:1.25rem; margin-bottom:1rem; }
    .latest.critical { border-color:#e7b9bc; border-top-color:#b3363e; }
    .latest.warning { border-color:#ead8a6; border-top-color:#c48b12; }
    .latest.disconnected { border-color:#c8d1d8; border-top-color:#6e7d88; }
    .latest-heading { display:flex; justify-content:space-between; gap:1rem; align-items:start; }.latest-heading h2 { margin:.25rem 0; font-size:2rem; }.latest-heading p,.kicker { color:#52677b; }.kicker { font-size:.72rem; font-weight:800; letter-spacing:.08em; }
    .risk-state { background:#e9f8f4; color:#08765a; border-radius:999px; padding:.45rem .75rem; font-weight:800; font-size:.75rem; }.critical .risk-state { background:#fbeaec; color:#a02d35; }
    .warning .risk-state { background:#fff5d9; color:#8a5b00; }.disconnected .risk-state { background:#edf1f4; color:#52616b; }
    .metric-grid { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:.75rem; margin:1.25rem 0; }
    .metric-grid div { background:#f4f8fa; border:1px solid #e0e9ee; border-radius:.75rem; padding:.85rem; min-width:0; }.metric-grid lucide-icon { color:#087f8c; }.metric-grid span,.metric-grid small { display:block; color:#52677b; font-size:.68rem; margin-top:.35rem; }.metric-grid strong { display:block; font-size:1.35rem; margin-top:.3rem; overflow-wrap:anywhere; }
    .risks,.context-actions { display:flex; flex-wrap:wrap; gap:.6rem; }.risks span { border-radius:999px; background:#fbeaec; color:#a02d35; padding:.45rem .7rem; font-size:.75rem; font-weight:800; }.context-actions { border-top:1px solid #e0e9ee; margin-top:1rem; padding-top:1rem; }
    .section-heading span { color:#52677b; }.critical-row { background:#fff7f7; }
    @media(max-width:1000px){.metric-grid{grid-template-columns:repeat(3,1fr)}}
    @media(max-width:700px){.process-flow{grid-template-columns:1fr}.process-flow>lucide-icon{transform:rotate(90deg);justify-self:center}.metric-grid{grid-template-columns:repeat(2,1fr)}.latest-heading{flex-direction:column}}
  `],
})
export class TelemetryView implements OnDestroy {
  readonly vehicles = inject(VehicleStore);
  private readonly api = inject(TelemetryApi);
  readonly readings = signal<TelemetryReadingData[]>([]);
  readonly loading = signal(false);
  readonly error = signal("");
  readonly selectedVehicleId = signal(0);
  readonly autoRefresh = signal(true);
  readonly latest = computed(() => this.readings()[0] ?? null);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    void this.initialize();
  }

  async initialize(): Promise<void> {
    await this.vehicles.loadForUser();
    await this.load();
    this.startTimer();
  }

  async load(): Promise<void> {
    this.loading.set(true); this.error.set("");
    try {
      const data = await this.api.list(this.selectedVehicleId() || undefined);
      const allowed = new Set(this.vehicles.items().map((vehicle) => vehicle.id));
      this.readings.set(data.filter((reading) => allowed.has(reading.vehicleId)));
    } catch {
      this.error.set("No se pudo obtener la telemetría del backend.");
    } finally {
      this.loading.set(false);
    }
  }

  selectVehicle(id: number): void { this.selectedVehicleId.set(id); void this.load(); }
  toggleRefresh(): void {
    this.autoRefresh.update((value) => !value);
    if (this.autoRefresh()) this.startTimer();
    else this.stopTimer();
  }
  plate(id: number): string { return this.vehicles.items().find((vehicle) => vehicle.id === id)?.plate ?? "—"; }
  hasLocation(reading: TelemetryReadingData): boolean { return reading.latitude !== null && reading.longitude !== null; }
  mapUrl(reading: TelemetryReadingData): string { return `https://www.openstreetmap.org/?mlat=${reading.latitude}&mlon=${reading.longitude}#map=17/${reading.latitude}/${reading.longitude}`; }
  dateTime(value: string): string { return new Intl.DateTimeFormat(document.documentElement.lang === "en" ? "en-US" : "es-PE", { dateStyle:"short", timeStyle:"medium" }).format(new Date(value)); }
  relativeTime(value: string): string { const seconds=Math.max(0,Math.round((Date.now()-new Date(value).getTime())/1000)); return seconds<60 ? `${seconds}s` : `${Math.floor(seconds/60)}m`; }
  riskLabel(value: string): string { return value.replaceAll("_", " "); }
  readingState(reading: TelemetryReadingData): "normal" | "warning" | "critical" | "disconnected" {
    if (Date.now() - new Date(reading.recordedAt).getTime() > 30_000) return "disconnected";
    if (reading.critical) return "critical";
    const temperatureMargin = Math.max(2, (reading.maximumTemperatureThreshold - reading.minimumTemperatureThreshold) * 0.1);
    const nearTemperatureLimit = reading.engineTemperatureCelsius <= reading.minimumTemperatureThreshold + temperatureMargin || reading.engineTemperatureCelsius >= reading.maximumTemperatureThreshold - temperatureMargin;
    const nearSpeedLimit = reading.gpsSpeedKph >= reading.maximumSpeedThreshold * 0.9;
    const nearBatteryLimit = reading.vehicleBatteryVoltage <= reading.minimumBatteryThreshold + 0.5;
    return nearTemperatureLimit || nearSpeedLimit || nearBatteryLimit ? "warning" : "normal";
  }
  ngOnDestroy(): void { this.stopTimer(); }
  private startTimer(): void { this.stopTimer(); if (this.autoRefresh()) this.timer=setInterval(() => void this.load(), 5_000); }
  private stopTimer(): void { if (this.timer) clearInterval(this.timer); this.timer=null; }
}
