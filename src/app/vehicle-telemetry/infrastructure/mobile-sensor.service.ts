import { Injectable, signal } from "@angular/core";

export interface MobileSensorSnapshot {
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  speedKph: number;
  headingDegrees: number | null;
  distanceKm: number;
  accelerationMagnitude: number;
  harshMovementDetected: boolean;
}

type PermissionAwareMotion = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

@Injectable({ providedIn: "root" })
export class MobileSensorService {
  readonly active = signal(false);
  readonly error = signal("");
  readonly snapshot = signal<MobileSensorSnapshot>({
    latitude: null, longitude: null, accuracyMeters: null, speedKph: 0,
    headingDegrees: null, distanceKm: 0, accelerationMagnitude: 0,
    harshMovementDetected: false,
  });
  private watchId: number | null = null;
  private previous: GeolocationPosition | null = null;
  private readonly motionHandler = (event: DeviceMotionEvent): void => {
    const value = event.acceleration ?? event.accelerationIncludingGravity;
    if (!value) return;
    const magnitude = Math.sqrt((value.x ?? 0) ** 2 + (value.y ?? 0) ** 2 + (value.z ?? 0) ** 2);
    this.snapshot.update((current) => ({
      ...current,
      accelerationMagnitude: this.round(magnitude, 2),
      harshMovementDetected: magnitude >= 12,
    }));
  };

  async start(): Promise<void> {
    this.error.set("");
    if (!window.isSecureContext && location.hostname !== "localhost")
      throw new Error("Los sensores requieren HTTPS.");
    if (!("geolocation" in navigator)) throw new Error("GPS no disponible.");
    const motion = DeviceMotionEvent as PermissionAwareMotion;
    if (typeof motion.requestPermission === "function" && await motion.requestPermission() !== "granted")
      throw new Error("Permiso de movimiento denegado.");
    window.addEventListener("devicemotion", this.motionHandler);
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.consume(position),
      (error) => this.error.set(error.message),
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 15_000 },
    );
    this.active.set(true);
  }

  stop(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    window.removeEventListener("devicemotion", this.motionHandler);
    this.watchId = null; this.previous = null; this.active.set(false);
  }

  private consume(position: GeolocationPosition): void {
    const distance = this.previous ? this.distance(this.previous.coords, position.coords) : 0;
    const hours = this.previous ? (position.timestamp - this.previous.timestamp) / 3_600_000 : 0;
    this.snapshot.update((current) => ({
      ...current,
      latitude: this.round(position.coords.latitude, 6),
      longitude: this.round(position.coords.longitude, 6),
      accuracyMeters: this.round(position.coords.accuracy, 1),
      speedKph: this.round(position.coords.speed !== null ? position.coords.speed * 3.6 : (hours > 0 ? distance / hours : 0), 1),
      headingDegrees: position.coords.heading === null ? null : this.round(position.coords.heading, 1),
      distanceKm: this.round(current.distanceKm + distance, 3),
    }));
    this.previous = position;
  }

  private distance(a: GeolocationCoordinates, b: GeolocationCoordinates): number {
    const radians = (value: number): number => value * Math.PI / 180;
    const dLat = radians(b.latitude - a.latitude); const dLon = radians(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  private round(value: number, decimals: number): number { const factor = 10 ** decimals; return Math.round(value * factor) / factor; }
}
