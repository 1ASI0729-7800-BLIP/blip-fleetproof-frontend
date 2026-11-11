import { BaseResource } from "../../shared/infrastructure/base-response";
export interface VehicleData extends BaseResource {
  userId: number;
  fleetId: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  responsible: string;
  vin: string;
  owner: string;
}
