import { BaseEntity } from "../../../shared/domain/model/base-entity";
export type RiskLevel = "low" | "medium" | "high" | "unknown";
export interface Finding {
  id: string;
  descriptionKey: string;
  severity: "medium" | "high";
  source: string;
}
export interface SourceCheck {
  name: string;
  status: "available" | "unavailable";
  checkedAt: string;
  evidence: string;
  findings: Finding[];
}

export class VehicleReport implements BaseEntity {
  #id: number;
  get id(): number {
    return this.#id;
  }
  #userId: number;
  get userId(): number {
    return this.#userId;
  }
  #vehicleId: number;
  get vehicleId(): number {
    return this.#vehicleId;
  }
  #plate: string;
  get plate(): string {
    return this.#plate;
  }
  #createdAt: string;
  get createdAt(): string {
    return this.#createdAt;
  }
  #version: number;
  get version(): number {
    return this.#version;
  }
  #sources: SourceCheck[];
  get sources(): SourceCheck[] {
    return this.#sources;
  }
  constructor(
    id: number,
    userId: number,
    vehicleId: number,
    plate: string,
    createdAt: string,
    version: number,
    sources: SourceCheck[],
  ) {
    this.#id = id;
    this.#userId = userId;
    this.#vehicleId = vehicleId;
    this.#plate = plate;
    this.#createdAt = createdAt;
    this.#version = version;
    this.#sources = sources;
  }
  get findings(): Finding[] {
    return this.sources
      .filter((s) => s.status === "available")
      .flatMap((s) => s.findings);
  }
  get complete(): boolean {
    return (
      this.sources.length > 0 &&
      this.sources.every((s) => s.status === "available")
    );
  }
  get risk(): RiskLevel {
    if (this.findings.some((f) => f.severity === "high")) return "high";
    if (this.findings.some((f) => f.severity === "medium")) return "medium";
    return this.complete ? "low" : "unknown";
  }
  get explanation(): string {
    return (
      "report.risk" + this.risk.charAt(0).toUpperCase() + this.risk.slice(1)
    );
  }
}
export function compareReports(
  previous: VehicleReport,
  current: VehicleReport,
): Finding[] {
  const comparable = new Set(
    previous.sources.filter((s) => s.status === "available").map((s) => s.name),
  );
  const oldIds = new Set(previous.findings.map((f) => f.id));
  return current.sources
    .filter((s) => s.status === "available" && comparable.has(s.name))
    .flatMap((s) => s.findings)
    .filter((f) => !oldIds.has(f.id));
}
