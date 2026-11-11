import { compareReports, SourceCheck, VehicleReport } from "./vehicle-report.entity";

describe("VehicleReport risk and comparison", () => {
  const source = (name: string, status: "available" | "unavailable", id?: string): SourceCheck => ({
    name, status, checkedAt: "2026-10-29T12:00:00Z", evidence: "synthetic",
    findings: id ? [{ id, descriptionKey: "finding.unpaid", severity: "high", source: name }] : [],
  });
  const report = (sources: SourceCheck[], vehicle = 1) =>
    new VehicleReport(1, 1, vehicle, "ABC-123", "2026-10-29T12:00:00Z", 1, sources);

  it("does not report low risk when a source is unavailable", () => {
    expect(report([source("SAT", "unavailable")]).risk).toBe("unknown");
  });
  it("ignores findings from unavailable sources", () => {
    const item = report([source("SAT", "unavailable", "fine")]);
    expect(item.findings).toEqual([]);
    expect(item.risk).toBe("unknown");
  });
  it("keeps a known high risk even if another source is unavailable", () => {
    expect(report([source("SAT", "available", "fine"), source("SOAT", "unavailable")]).risk).toBe("high");
  });
  it("compares finding IDs within their source, not globally", () => {
    const before = report([source("SAT", "available", "same"), source("SOAT", "available")]);
    const after = report([source("SAT", "available", "same"), source("SOAT", "available", "same")]);
    expect(compareReports(before, after).map(f => f.source)).toEqual(["SOAT"]);
  });
  it("does not compare different vehicles", () => {
    expect(compareReports(report([source("SAT", "available")]), report([source("SAT", "available", "fine")], 2))).toEqual([]);
  });
  it("detects an escalation even when a finding keeps its ID", () => {
    const before = report([source("SAT", "available", "fine")]);
    before.sources[0].findings[0].severity = "medium";
    expect(compareReports(before, report([source("SAT", "available", "fine")])).length).toBe(1);
  });
  it("does not call a newly available source a confirmed change", () => {
    expect(compareReports(report([source("SAT", "unavailable")]), report([source("SAT", "available", "fine")]))).toEqual([]);
  });
});
