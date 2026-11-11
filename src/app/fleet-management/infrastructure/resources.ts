import { BaseResource } from "../../shared/infrastructure/base-response";
export interface FleetData extends BaseResource {
  userId: number;
  name: string;
}
export interface CaseData extends BaseResource {
  userId: number;
  vehicleId: number;
  reportId: number | null;
  findingId: string;
  title: string;
  responsible: string;
  dueDate: string;
  status: "open" | "in-progress" | "resolved";
  evidence: string;
  notes: string;
  createdAt: string;
}
