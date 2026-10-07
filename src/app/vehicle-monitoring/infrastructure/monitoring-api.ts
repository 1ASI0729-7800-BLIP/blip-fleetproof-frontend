import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-endpoint";
import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { BaseResponse } from "../../shared/infrastructure/base-response";
import { Monitoring, Alert } from "../domain/model/monitoring.entity";
import { MonitoringData, AlertData } from "./resources";
export interface MonitoringResponse extends BaseResponse {
  monitoring: MonitoringData[];
}
export interface AlertsResponse extends BaseResponse {
  alerts: AlertData[];
}
export class MonitoringAssembler implements BaseAssembler<
  Monitoring,
  MonitoringData,
  MonitoringResponse
> {
  toEntityFromResource(m: MonitoringData): Monitoring {
    return new Monitoring(m.id, m.userId, m.vehicleId, m.status, m.lastCycle);
  }
  toResourceFromEntity(m: Monitoring): MonitoringData {
    return {
      id: m.id,
      userId: m.userId,
      vehicleId: m.vehicleId,
      status: m.status,
      lastCycle: m.lastCycle,
    };
  }
  toEntitiesFromResponse(r: MonitoringResponse): Monitoring[] {
    return r.monitoring.map((m) => this.toEntityFromResource(m));
  }
}
export class AlertAssembler implements BaseAssembler<
  Alert,
  AlertData,
  AlertsResponse
> {
  toEntityFromResource(a: AlertData): Alert {
    return new Alert(
      a.id,
      a.userId,
      a.vehicleId,
      a.reportId,
      a.type,
      a.status,
      a.createdAt,
      a.messageKey,
    );
  }
  toResourceFromEntity(a: Alert): AlertData {
    return {
      id: a.id,
      userId: a.userId,
      vehicleId: a.vehicleId,
      reportId: a.reportId,
      type: a.type,
      status: a.status,
      createdAt: a.createdAt,
      messageKey: a.messageKey,
    };
  }
  toEntitiesFromResponse(r: AlertsResponse): Alert[] {
    return r.alerts.map((a) => this.toEntityFromResource(a));
  }
}
@Injectable({ providedIn: "root" })
export class MonitoringApi extends BaseApiEndpoint<
  Monitoring,
  MonitoringData,
  MonitoringResponse
> {
  constructor() {
    super(
      inject(HttpClient),
      environment.platformProviderApiBaseUrl +
        environment.platformProviderMonitoringEndpointPath,
      new MonitoringAssembler(),
    );
  }
}
@Injectable({ providedIn: "root" })
export class AlertApi extends BaseApiEndpoint<
  Alert,
  AlertData,
  AlertsResponse
> {
  constructor() {
    super(
      inject(HttpClient),
      environment.platformProviderApiBaseUrl +
        environment.platformProviderAlertsEndpointPath,
      new AlertAssembler(),
    );
  }
}
