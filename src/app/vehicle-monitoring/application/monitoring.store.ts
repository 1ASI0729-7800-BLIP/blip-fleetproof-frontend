import { Injectable, inject, signal } from "@angular/core";
import { ResourceStore } from "../../shared/application/resource.store";
import { IamStore } from "../../iam/application/iam.store";
import { Vehicle } from "../../vehicle-information/domain/model/vehicle.entity";
import { ReportStore } from "../../report-management/application/report.store";
import { compareReports } from "../../report-management/domain/model/vehicle-report.entity";
import { Monitoring, Alert } from "../domain/model/monitoring.entity";
import { MonitoringData } from "../infrastructure/resources";
import {
  MonitoringApi,
  MonitoringResponse,
} from "../infrastructure/monitoring-api";
import { AlertStore } from "./alert.store";
@Injectable({ providedIn: "root" })
export class MonitoringStore extends ResourceStore<
  Monitoring,
  MonitoringData,
  MonitoringResponse
> {
  private readonly iam = inject(IamStore);
  private readonly reports = inject(ReportStore);
  private readonly alerts = inject(AlertStore);
  readonly running = signal<number | null>(null);
  readonly success = signal(false);
  constructor() {
    super(inject(MonitoringApi));
  }
  loadForUser(): Promise<void> {
    return this.load({ userId: this.iam.user()!.id });
  }
  async activate(vehicleId: number): Promise<void> {
    if (this.items().some((m) => m.vehicleId === vehicleId)) {
      this.error.set("monitoring.already");
      return;
    }
    await this.save(new Monitoring(0, this.iam.user()!.id, vehicleId));
  }
  async toggle(m: Monitoring): Promise<void> {
    await this.save(
      new Monitoring(
        m.id,
        m.userId,
        m.vehicleId,
        m.status === "active" ? "paused" : "active",
        m.lastCycle,
      ),
    );
  }
  async cycle(m: Monitoring, vehicle: Vehicle): Promise<void> {
    if (this.running() !== null || m.status !== "active") return;
    this.running.set(m.id);
    this.success.set(false);
    this.error.set(null);
    try {
      await this.reports.loadForUser();
      if (this.reports.error()) {
        this.error.set(this.reports.error());
        return;
      }
      const previous = this.reports.latest(vehicle.id);
      const report = await this.reports.generate(vehicle);
      if (!report) {
        this.error.set(this.reports.error() || "common.saveError");
        return;
      }
      const types: ("documentary" | "technical")[] = [];
      if (previous && compareReports(previous, report).length)
        types.push("documentary");
      if (!report.complete) types.push("technical");
      for (const type of types) {
        const alert = await this.alerts.save(
          new Alert(
            0,
            this.iam.user()!.id,
            vehicle.id,
            report.id,
            type,
            "open",
            report.createdAt,
            type === "technical" ? "alerts.partial" : "alerts.newFinding",
          ),
        );
        if (!alert) {
          this.error.set("monitoring.cycleIncomplete");
          return;
        }
      }
      const saved = await this.save(
        new Monitoring(m.id, m.userId, m.vehicleId, m.status, report.createdAt),
      );
      if (!saved) {
        this.error.set("monitoring.cycleIncomplete");
        return;
      }
      this.success.set(true);
    } finally {
      this.running.set(null);
    }
  }
}
