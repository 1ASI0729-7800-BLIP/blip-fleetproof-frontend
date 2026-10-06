import { BaseResource } from "../../shared/infrastructure/base-response";
import { SourceCheck } from "../domain/model/vehicle-report.entity";
export interface ReportData extends BaseResource {
  userId: number;
  vehicleId: number;
  plate: string;
  createdAt: string;
  version: number;
  sources: SourceCheck[];
}
