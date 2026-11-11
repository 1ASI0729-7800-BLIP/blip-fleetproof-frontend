import { BaseEntity } from "../../../shared/domain/model/base-entity";

export class Subscription implements BaseEntity {
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly plan: string,
    readonly vehicleLimit: number,
    readonly status: string,
  ) {}

  get active(): boolean {
    return this.status === "active";
  }
}
