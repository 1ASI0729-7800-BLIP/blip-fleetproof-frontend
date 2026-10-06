import { BaseResource } from "../../shared/infrastructure/base-response";
export interface MonitoringData extends BaseResource {
  userId: number;
  vehicleId: number;
  status: "active" | "paused";
  lastCycle: string | null;
}
export interface AlertData extends BaseResource {
  userId: number;
  vehicleId: number;
  reportId: number;
  type: "documentary" | "technical";
  status: "open" | "reviewed";
  createdAt: string;
  messageKey: string;
}
