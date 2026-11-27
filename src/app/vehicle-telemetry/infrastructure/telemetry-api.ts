import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";

export interface TelemetryReadingData {
  id: number;
  userId: number;
  vehicleId: number;
  deviceId: string;
  recordedAt: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracyMeters: number | null;
  gpsSpeedKph: number;
  headingDegrees: number | null;
  sessionDistanceKm: number;
  accelerationMagnitude: number;
  harshMovementDetected: boolean;
  engineTemperatureCelsius: number;
  vehicleBatteryVoltage: number;
  engineRpm: number;
  locationSource: "DEVICE_SENSOR" | "SIMULATED";
  motionSource: "DEVICE_SENSOR" | "SIMULATED";
  engineDataSource: "DEVICE_SENSOR" | "SIMULATED";
  critical: boolean;
  risks: string[];
  alertId: number | null;
  resolutionCaseId: number | null;
}

@Injectable({ providedIn: "root" })
export class TelemetryApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint =
    environment.platformProviderApiBaseUrl + environment.platformProviderTelemetryEndpointPath;

  list(vehicleId?: number, limit = 100): Promise<TelemetryReadingData[]> {
    let params = new HttpParams().set("limit", limit);
    if (vehicleId) params = params.set("vehicleId", vehicleId);
    return firstValueFrom(this.http.get<TelemetryReadingData[]>(this.endpoint, { params }));
  }
}
