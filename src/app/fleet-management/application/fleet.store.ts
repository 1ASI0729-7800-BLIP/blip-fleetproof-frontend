import { Injectable, inject } from "@angular/core";
import { ResourceStore } from "../../shared/application/resource.store";
import { IamStore } from "../../iam/application/iam.store";
import {
  FleetApi,
  FleetsResponse,
  CaseApi,
  CasesResponse,
} from "../infrastructure/fleet-api";
import { Fleet, ResolutionCase } from "../domain/model/fleet.entity";
import { FleetData, CaseData } from "../infrastructure/resources";
@Injectable({ providedIn: "root" })
export class FleetStore extends ResourceStore<
  Fleet,
  FleetData,
  FleetsResponse
> {
  private readonly iam = inject(IamStore);
  constructor() {
    super(inject(FleetApi));
  }
  loadForUser(): Promise<void> {
    return this.load({ userId: this.iam.user()!.id });
  }
  async create(name: string): Promise<Fleet | null> {
    if (!name.trim()) return null;
    return this.save(new Fleet(0, this.iam.user()!.id, name.trim()));
  }
}
@Injectable({ providedIn: "root" })
export class CaseStore extends ResourceStore<
  ResolutionCase,
  CaseData,
  CasesResponse
> {
  private readonly iam = inject(IamStore);
  constructor() {
    super(inject(CaseApi));
  }
  loadForUser(): Promise<void> {
    return this.load({ userId: this.iam.user()!.id });
  }
  override async save(item: ResolutionCase): Promise<ResolutionCase | null> {
    if (item.status === "resolved" && !item.canResolve) {
      this.error.set("cases.evidenceRequired");
      return null;
    }
    if (!item.title.trim() || !item.responsible.trim() || !item.vehicleId) {
      this.error.set("common.required");
      return null;
    }
    item.userId = this.iam.user()!.id;
    return super.save(item);
  }
}
