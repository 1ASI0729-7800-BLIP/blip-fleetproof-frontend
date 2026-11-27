import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { MobileSensorService } from "../../infrastructure/mobile-sensor.service";
import { TelemetryApi, TelemetryReadingData } from "../../infrastructure/telemetry-api";

@Component({
  imports: [...UI_IMPORTS, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="page-heading">
      <div><h1>{{ "telemetry.simulator" | translate }}</h1><p>{{ "telemetry.simulatorSubtitle" | translate }}</p></div>
      <a mat-stroked-button routerLink="/telemetry"><lucide-icon name="arrow-left" size="17" />{{ "telemetry.viewTelemetry" | translate }}</a>
    </div>

    <div class="source-notice"><b>DEVICE_SENSOR:</b> GPS y movimiento del celular · <b>SIMULATED:</b> temperatura, batería vehicular y RPM.</div>

    <section class="sim-grid">
      <article class="section">
        <h2>1. {{ "telemetry.sense" | translate }}</h2>
        <mat-form-field appearance="outline"><mat-label>Device ID</mat-label><input matInput [(ngModel)]="deviceId" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>{{ "telemetry.vehicle" | translate }}</mat-label><mat-select [(ngModel)]="vehicleId">
          @for (vehicle of vehicles.items(); track vehicle.id) { <mat-option [value]="vehicle.id">{{ vehicle.plate }} · {{ vehicle.brand }}</mat-option> }
        </mat-select></mat-form-field>
        <div class="buttons">
          <button mat-flat-button (click)="startSensors()" [disabled]="sensors.active()">{{ "telemetry.startSensors" | translate }}</button>
          <button mat-stroked-button (click)="stop()" [disabled]="!sensors.active()">{{ "telemetry.stop" | translate }}</button>
        </div>
        @if (sensors.error()) { <p class="error">{{ sensors.error() }}</p> }
      </article>

      <article class="section sensor-card">
        <h2>{{ "telemetry.realSensors" | translate }}</h2>
        <div class="metrics">
          <div><span>{{ "telemetry.speed" | translate }}</span><strong>{{ sensors.snapshot().speedKph }}</strong><small>km/h</small></div>
          <div><span>{{ "telemetry.distance" | translate }}</span><strong>{{ sensors.snapshot().distanceKm }}</strong><small>km</small></div>
          <div><span>{{ "telemetry.acceleration" | translate }}</span><strong>{{ sensors.snapshot().accelerationMagnitude }}</strong><small>m/s²</small></div>
          <div><span>GPS</span><strong>{{ sensors.snapshot().accuracyMeters ?? "—" }}</strong><small>m</small></div>
        </div>
      </article>
    </section>

    <section class="section">
      <h2>2. {{ "telemetry.analyze" | translate }}</h2>
      <div class="values-grid">
        <label>{{ "telemetry.temperature" | translate }} <input type="number" [(ngModel)]="temperature" /> °C</label>
        <label>{{ "telemetry.battery" | translate }} <input type="number" step=".1" [(ngModel)]="battery" /> V</label>
        <label>RPM <input type="number" [(ngModel)]="rpm" /></label>
      </div>
      <h3>{{ "telemetry.configuredThresholds" | translate }}</h3>
      <div class="values-grid thresholds">
        <label>Temp. min <input type="number" [(ngModel)]="minimumTemperature" /> °C</label>
        <label>Temp. max <input type="number" [(ngModel)]="maximumTemperature" /> °C</label>
        <label>Velocidad max <input type="number" [(ngModel)]="maximumSpeed" /> km/h</label>
        <label>Batería min <input type="number" step=".1" [(ngModel)]="minimumBattery" /> V</label>
      </div>
      <div class="buttons scenarios"><button (click)="normal()">Normal</button><button class="danger" (click)="temperature=112">Sobrecalentamiento</button><button class="danger" (click)="battery=11.2">Batería baja</button></div>
    </section>

    <section class="section transmission" [class.critical]="last()?.critical">
      <div><h2>3. {{ "telemetry.act" | translate }}</h2><p>{{ "telemetry.transmissionHelp" | translate }}</p></div>
      <div class="buttons">
        @if (!automatic()) { <button mat-flat-button (click)="startAutomatic()">{{ "telemetry.startTransmission" | translate }}</button> }
        @else { <button mat-flat-button color="warn" (click)="stopAutomatic()">{{ "telemetry.stop" | translate }}</button> }
        <button mat-stroked-button (click)="send()" [disabled]="sending()">{{ "telemetry.sendNow" | translate }}</button>
      </div>
      @if (message()) { <p class="result">{{ message() }}</p> }
      @if (last(); as reading) {
        <div class="result-grid"><span>ID: {{ reading.id }}</span><span>{{ reading.critical ? "CRITICAL" : "NORMAL" }}</span><span>Alert: {{ reading.alertId ?? "—" }}</span><span>Case: {{ reading.resolutionCaseId ?? "—" }}</span></div>
      }
    </section>
  `,
  styles: [`
    :host{display:block}.source-notice{background:#e8f6f5;border:1px solid #b8dfd9;border-radius:.75rem;padding:.8rem;margin-bottom:1rem;color:#23485d}.sim-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.section{margin-bottom:1rem}.section h2{margin-top:0}.section mat-form-field{width:100%}.buttons{display:flex;gap:.7rem;flex-wrap:wrap}.metrics,.values-grid,.result-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.75rem}.metrics div{background:#f4f8fa;border:1px solid #dce6ec;border-radius:.7rem;padding:.8rem}.metrics span,.metrics small{display:block;color:#52677b;font-size:.72rem}.metrics strong{font-size:1.5rem}.values-grid label{display:flex;flex-direction:column;gap:.35rem;color:#52677b;font-size:.8rem}.values-grid input{border:1px solid #cbd9e1;border-radius:.55rem;padding:.7rem}.thresholds{border-top:1px solid #dce6ec;padding-top:1rem}.scenarios{margin-top:1rem}.scenarios button{border:1px solid #b9cbd5;border-radius:.55rem;padding:.6rem .8rem;background:white}.scenarios .danger{border-color:#e7b9bc;color:#a02d35}.transmission{border-top:4px solid #087f8c}.transmission.critical{border-top-color:#b3363e}.result{padding:.7rem;background:#f4f8fa;border-radius:.55rem}.result-grid span{background:#12334c;color:white;padding:.65rem;border-radius:.5rem;text-align:center}@media(max-width:750px){.sim-grid{grid-template-columns:1fr}.metrics,.values-grid,.result-grid{grid-template-columns:repeat(2,1fr)}}
  `],
})
export class IotSimulatorView implements OnDestroy {
  readonly vehicles = inject(VehicleStore); readonly sensors = inject(MobileSensorService); private readonly api = inject(TelemetryApi);
  readonly automatic = signal(false); readonly sending = signal(false); readonly message = signal(""); readonly last = signal<TelemetryReadingData | null>(null);
  deviceId = `PHONE-${Math.random().toString(36).slice(2,8).toUpperCase()}`; vehicleId=0; temperature=88; battery=12.4; rpm=1800;
  minimumTemperature=70; maximumTemperature=105; maximumSpeed=100; minimumBattery=11.8; private timer:ReturnType<typeof setInterval>|null=null;
  constructor(){void this.vehicles.loadForUser().then(()=>{if(this.vehicles.items().length)this.vehicleId=this.vehicles.items()[0].id;});}
  async startSensors():Promise<void>{try{await this.sensors.start();this.message.set("Sensores activados.");}catch(error){this.message.set(error instanceof Error?error.message:"No se activaron los sensores.");}}
  normal():void{this.temperature=88;this.battery=12.4;this.rpm=1800;}
  async send():Promise<void>{if(!this.vehicleId||!this.deviceId.trim()){this.message.set("Selecciona un vehículo e identifica el dispositivo.");return;}this.sending.set(true);try{await this.api.registerDevice({deviceId:this.deviceId,vehicleId:this.vehicleId,name:"FleetProof mobile simulator",active:true,minimumTemperatureCelsius:this.minimumTemperature,maximumTemperatureCelsius:this.maximumTemperature,maximumSpeedKph:this.maximumSpeed,minimumBatteryVoltage:this.minimumBattery});const s=this.sensors.snapshot();const result=await this.api.send({deviceId:this.deviceId,vehicleId:this.vehicleId,recordedAt:new Date().toISOString(),latitude:s.latitude,longitude:s.longitude,locationAccuracyMeters:s.accuracyMeters,gpsSpeedKph:s.speedKph,headingDegrees:s.headingDegrees,sessionDistanceKm:s.distanceKm,accelerationMagnitude:s.accelerationMagnitude,harshMovementDetected:s.harshMovementDetected,engineTemperatureCelsius:this.temperature,vehicleBatteryVoltage:this.battery,engineRpm:this.rpm,locationSource:"DEVICE_SENSOR",motionSource:"DEVICE_SENSOR",engineDataSource:"SIMULATED"});this.last.set(result);this.message.set(result.critical?"Anomalía procesada: se generó alerta e incidencia.":"Lectura normal registrada en FleetProof.");}catch{this.message.set("No se pudo transmitir. Verifica el backend y la asociación del dispositivo.");}finally{this.sending.set(false);}}
  startAutomatic():void{this.stopAutomatic();this.automatic.set(true);void this.send();this.timer=setInterval(()=>void this.send(),5_000);}
  stopAutomatic():void{if(this.timer)clearInterval(this.timer);this.timer=null;this.automatic.set(false);}
  stop():void{this.stopAutomatic();this.sensors.stop();}
  ngOnDestroy():void{this.stop();}
}
