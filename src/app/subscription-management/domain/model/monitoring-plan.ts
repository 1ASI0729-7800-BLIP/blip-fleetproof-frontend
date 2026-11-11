export type PlanFrequency = "weekly" | "monthly" | "annual";

export interface MonitoringPlan {
  frequency: PlanFrequency;
  amount: number;
  vehicleLimit: number;
}

export const individualPlans: readonly MonitoringPlan[] = [
  { frequency: "weekly", amount: 9, vehicleLimit: 1 },
  { frequency: "monthly", amount: 25, vehicleLimit: 1 },
  { frequency: "annual", amount: 190, vehicleLimit: 1 },
];

export const fleetPlans: readonly MonitoringPlan[] = [
  { frequency: "weekly", amount: 49, vehicleLimit: 10 },
  { frequency: "monthly", amount: 149, vehicleLimit: 15 },
  { frequency: "annual", amount: 1390, vehicleLimit: 15 },
];
