import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";

export type CaseAction =
  | "ASSIGN"
  | "CONTACT_DRIVER"
  | "DRIVER_RESPONDED"
  | "DRIVER_NO_RESPONSE"
  | "ESCALATE"
  | "REQUEST_ASSISTANCE"
  | "RECORD_SOLUTION"
  | "RESOLVE"
  | "CLOSE";

export interface CaseActivityData {
  id: number;
  caseId: number;
  actorId: number;
  action: string;
  description: string;
  responsible: string;
  recordedAt: string;
}

@Injectable({ providedIn: "root" })
export class CaseWorkflowApi {
  private readonly http = inject(HttpClient);
  private readonly casesUrl =
    environment.platformProviderApiBaseUrl + environment.platformProviderCasesEndpointPath;

  activities(caseId: number): Promise<CaseActivityData[]> {
    return firstValueFrom(this.http.get<CaseActivityData[]>(`${this.casesUrl}/${caseId}/activities`));
  }

  addActivity(
    caseId: number,
    value: { actorId: number; action: CaseAction; description: string; responsible?: string },
  ): Promise<CaseActivityData> {
    return firstValueFrom(this.http.post<CaseActivityData>(`${this.casesUrl}/${caseId}/activities`, value));
  }
}
