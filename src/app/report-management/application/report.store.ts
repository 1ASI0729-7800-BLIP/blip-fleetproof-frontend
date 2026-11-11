import { Injectable, inject, signal } from "@angular/core";
import { IamStore } from "../../iam/application/iam.store";
import { ResourceStore } from "../../shared/application/resource.store";
import { Vehicle } from "../../vehicle-information/domain/model/vehicle.entity";
import { ReportApi, ReportsResponse } from "../infrastructure/report-api";
import { VehicleReport } from "../domain/model/vehicle-report.entity";
import { ReportData } from "../infrastructure/resources";
@Injectable({ providedIn: "root" })
export class ReportStore extends ResourceStore<
  VehicleReport,
  ReportData,
  ReportsResponse
> {
  private readonly iam = inject(IamStore);
  private readonly api = inject(ReportApi);
  readonly generating = signal(false);
  constructor() {
    super(inject(ReportApi));
  }
  loadForUser(): Promise<void> {
    return this.load({ userId: this.iam.user()!.id });
  }
  latest(vehicleId: number): VehicleReport | undefined {
    return this.forVehicle(vehicleId)[0];
  }
  forVehicle(vehicleId: number): VehicleReport[] {
    return this.items()
      .filter((r) => r.vehicleId === vehicleId)
      .sort((a, b) => b.version - a.version);
  }
  async generate(vehicle: Vehicle): Promise<VehicleReport | null> {
    if (this.generating() || vehicle.userId !== this.iam.user()?.id)
      return null;
    this.generating.set(true);
    this.error.set(null);
    try {
      await this.loadForUser();
      if (this.error()) return null;
      const version = (this.latest(vehicle.id)?.version || 0) + 1;
      const sources = await this.api.sources(vehicle.plate, version);
      return await this.save(
        new VehicleReport(
          0,
          this.iam.user()!.id,
          vehicle.id,
          vehicle.plate,
          new Date().toISOString(),
          version,
          sources,
        ),
      );
    } catch {
      this.error.set("common.loadError");
      return null;
    } finally {
      this.generating.set(false);
    }
  }
}
