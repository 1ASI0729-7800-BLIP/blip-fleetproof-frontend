import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { IamStore } from "../../iam/application/iam.store";
import { ReportStore } from "../../report-management/application/report.store";
import { VehicleReport } from "../../report-management/domain/model/vehicle-report.entity";
import { Vehicle } from "../../vehicle-information/domain/model/vehicle.entity";
import { Monitoring } from "../domain/model/monitoring.entity";
import { MonitoringApi } from "../infrastructure/monitoring-api";
import { AlertStore } from "./alert.store";
import { MonitoringStore } from "./monitoring.store";

describe("MonitoringStore first cycle", () => {
  const vehicle = new Vehicle(1, 1, 0, "ABC-123", "Demo", "Demo", 2026, "Demo");
  let store: MonitoringStore;
  let reports: { loadForUser: jasmine.Spy; error: ReturnType<typeof signal<string | null>>; latest: jasmine.Spy; generate: jasmine.Spy };
  let alerts: { save: jasmine.Spy };
  beforeEach(() => {
    reports = { loadForUser: jasmine.createSpy().and.resolveTo(), error: signal<string | null>(null), latest: jasmine.createSpy().and.returnValue(undefined), generate: jasmine.createSpy() };
    alerts = { save: jasmine.createSpy().and.resolveTo({ id: 1 }) };
    TestBed.configureTestingModule({providers: [MonitoringStore,
      { provide: IamStore, useValue: { user: () => ({ id: 1 }) } },
      { provide: ReportStore, useValue: reports },
      { provide: AlertStore, useValue: alerts },
      { provide: MonitoringApi, useValue: {} },
    ]});
    store = TestBed.inject(MonitoringStore);
    spyOn(store, "save").and.resolveTo(new Monitoring(1, 1, 1));
  });
  it("creates a documentary alert for findings in the first report", async () => {
    reports.generate.and.resolveTo(new VehicleReport(1, 1, 1, "ABC-123", new Date().toISOString(), 1, [{
      name: "SAT", status: "available", checkedAt: new Date().toISOString(), evidence: "demo", findings: [{ id: "fine", source: "SAT", severity: "high", descriptionKey: "finding.unpaid" }],
    }]));
    await store.cycle(new Monitoring(1, 1, 1), vehicle);
    expect(alerts.save.calls.first().args[0].type).toBe("documentary");
    expect(store.success()).toBeTrue();
  });
  it("does not label the cycle successful when an alert cannot be saved", async () => {
    reports.generate.and.resolveTo(new VehicleReport(1, 1, 1, "ABC-123", new Date().toISOString(), 1, []));
    alerts.save.and.resolveTo(null);
    await store.cycle(new Monitoring(1, 1, 1), vehicle);
    expect(store.success()).toBeFalse();
    expect(store.error()).toBe("monitoring.cycleIncomplete");
    expect(store.save).not.toHaveBeenCalled();
  });
  it("does not run paused monitoring", async () => {
    await store.cycle(new Monitoring(1, 1, 1, "paused"), vehicle);
    expect(reports.generate).not.toHaveBeenCalled();
  });
});
