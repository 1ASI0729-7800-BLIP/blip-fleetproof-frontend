import { Injectable, inject } from "@angular/core";
import { IamStore } from "../../iam/application/iam.store";
import { ResourceStore } from "../../shared/application/resource.store";
import { Alert } from "../domain/model/monitoring.entity";
import { AlertData } from "../infrastructure/resources";
import { AlertApi, AlertsResponse } from "../infrastructure/monitoring-api";
@Injectable({ providedIn: "root" })
export class AlertStore extends ResourceStore<
  Alert,
  AlertData,
  AlertsResponse
> {
  private readonly iam = inject(IamStore);
  constructor() {
    super(inject(AlertApi));
  }
  loadForUser(): Promise<void> {
    return this.load({ userId: this.iam.user()!.id });
  }
  async acknowledge(alert: Alert): Promise<void> {
    await this.save(
      new Alert(
        alert.id,
        alert.userId,
        alert.vehicleId,
        alert.reportId,
        alert.type,
        "reviewed",
        alert.createdAt,
        alert.messageKey,
      ),
    );
  }
}
