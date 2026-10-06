import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-endpoint";
import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { BaseResponse } from "../../shared/infrastructure/base-response";
import { Fleet, ResolutionCase } from "../domain/model/fleet.entity";
import { FleetData, CaseData } from "./resources";
export interface FleetsResponse extends BaseResponse {
  fleets: FleetData[];
}
export interface CasesResponse extends BaseResponse {
  cases: CaseData[];
}
export class FleetAssembler implements BaseAssembler<
  Fleet,
  FleetData,
  FleetsResponse
> {
  toEntityFromResource(f: FleetData): Fleet {
    return new Fleet(f.id, f.userId, f.name);
  }
  toResourceFromEntity(f: Fleet): FleetData {
    return { id: f.id, userId: f.userId, name: f.name };
  }
  toEntitiesFromResponse(r: FleetsResponse): Fleet[] {
    return r.fleets.map((f) => this.toEntityFromResource(f));
  }
}
export class CaseAssembler implements BaseAssembler<
  ResolutionCase,
  CaseData,
  CasesResponse
> {
  toEntityFromResource(c: CaseData): ResolutionCase {
    return new ResolutionCase(
      c.id,
      c.userId,
      c.vehicleId,
      c.reportId,
      c.findingId,
      c.title,
      c.responsible,
      c.dueDate,
      c.status,
      c.evidence,
      c.notes,
      c.createdAt,
    );
  }
  toResourceFromEntity(c: ResolutionCase): CaseData {
    return {
      id: c.id,
      userId: c.userId,
      vehicleId: c.vehicleId,
      reportId: c.reportId,
      findingId: c.findingId,
      title: c.title,
      responsible: c.responsible,
      dueDate: c.dueDate,
      status: c.status,
      evidence: c.evidence,
      notes: c.notes,
      createdAt: c.createdAt,
    };
  }
  toEntitiesFromResponse(r: CasesResponse): ResolutionCase[] {
    return r.cases.map((c) => this.toEntityFromResource(c));
  }
}
@Injectable({ providedIn: "root" })
export class FleetApi extends BaseApiEndpoint<
  Fleet,
  FleetData,
  FleetsResponse
> {
  constructor() {
    super(
      inject(HttpClient),
      environment.platformProviderApiBaseUrl +
        environment.platformProviderFleetsEndpointPath,
      new FleetAssembler(),
    );
  }
}
@Injectable({ providedIn: "root" })
export class CaseApi extends BaseApiEndpoint<
  ResolutionCase,
  CaseData,
  CasesResponse
> {
  constructor() {
    super(
      inject(HttpClient),
      environment.platformProviderApiBaseUrl +
        environment.platformProviderCasesEndpointPath,
      new CaseAssembler(),
    );
  }
}
