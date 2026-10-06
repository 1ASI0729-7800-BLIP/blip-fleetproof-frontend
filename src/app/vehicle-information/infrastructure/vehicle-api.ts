import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Vehicle } from "../domain/model/vehicle.entity";
import { VehicleData } from "./resources";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-endpoint";
import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { BaseResponse } from "../../shared/infrastructure/base-response";
import { environment } from "../../../environments/environment";
export interface VehiclesResponse extends BaseResponse {
  vehicles: VehicleData[];
}
export class VehicleAssembler implements BaseAssembler<
  Vehicle,
  VehicleData,
  VehiclesResponse
> {
  toEntityFromResource(v: VehicleData): Vehicle {
    return new Vehicle(
      v.id,
      v.userId,
      v.fleetId,
      v.plate,
      v.brand,
      v.model,
      v.year,
      v.responsible,
      v.vin,
      v.owner,
    );
  }
  toResourceFromEntity(v: Vehicle): VehicleData {
    return {
      id: v.id,
      userId: v.userId,
      fleetId: v.fleetId,
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      year: v.year,
      responsible: v.responsible,
      vin: v.vin,
      owner: v.owner,
    };
  }
  toEntitiesFromResponse(r: VehiclesResponse): Vehicle[] {
    return r.vehicles.map((v) => this.toEntityFromResource(v));
  }
}
@Injectable({ providedIn: "root" })
export class VehicleApi extends BaseApiEndpoint<
  Vehicle,
  VehicleData,
  VehiclesResponse
> {
  constructor() {
    super(
      inject(HttpClient),
      environment.platformProviderApiBaseUrl +
        environment.platformProviderVehiclesEndpointPath,
      new VehicleAssembler(),
    );
  }
}
