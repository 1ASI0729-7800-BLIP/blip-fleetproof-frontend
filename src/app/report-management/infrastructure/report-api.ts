import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-endpoint";
import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { BaseResponse } from "../../shared/infrastructure/base-response";
import {
  VehicleReport,
  SourceCheck,
} from "../domain/model/vehicle-report.entity";
import { ReportData } from "./resources";
export interface ReportsResponse extends BaseResponse {
  reports: ReportData[];
}
export class ReportAssembler implements BaseAssembler<
  VehicleReport,
  ReportData,
  ReportsResponse
> {
  toEntityFromResource(r: ReportData): VehicleReport {
    return new VehicleReport(
      r.id,
      r.userId,
      r.vehicleId,
      r.plate,
      r.createdAt,
      r.version,
      structuredClone(r.sources),
    );
  }
  toResourceFromEntity(r: VehicleReport): ReportData {
    return {
      id: r.id,
      userId: r.userId,
      vehicleId: r.vehicleId,
      plate: r.plate,
      createdAt: r.createdAt,
      version: r.version,
      sources: structuredClone(r.sources),
    };
  }
  toEntitiesFromResponse(r: ReportsResponse): VehicleReport[] {
    return r.reports.map((v) => this.toEntityFromResource(v));
  }
}
interface SourceFixture {
  id: number;
  plate: string;
  revisions: { sources: SourceCheck[] }[];
}
@Injectable({ providedIn: "root" })
export class ReportApi extends BaseApiEndpoint<
  VehicleReport,
  ReportData,
  ReportsResponse
> {
  constructor() {
    super(
      inject(HttpClient),
      environment.platformProviderApiBaseUrl +
        environment.platformProviderReportsEndpointPath,
      new ReportAssembler(),
    );
  }
  async sources(plate: string, version: number): Promise<SourceCheck[]> {
    const fixtures = await firstValueFrom(
      this.http.get<SourceFixture[]>(
        environment.platformProviderApiBaseUrl +
          environment.platformProviderSourceFixturesEndpointPath,
        {
          params: { plate },
        },
      ),
    );
    const now = new Date().toISOString();
    const revision =
      fixtures[0]?.revisions[
        Math.min(version - 1, fixtures[0].revisions.length - 1)
      ];
    return revision
      ? revision.sources.map((s) => ({ ...structuredClone(s), checkedAt: now }))
      : ["SUNARP", "SAT", "CITV", "SOAT"].map((name) => ({
          name,
          status: "unavailable",
          checkedAt: now,
          evidence: "",
          findings: [],
        }));
  }
}
