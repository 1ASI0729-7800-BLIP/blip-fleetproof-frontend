import { Injectable, inject } from "@angular/core";
import { ResourceStore } from "../../shared/application/resource.store";
import { IamStore } from "../../iam/application/iam.store";
import { VehicleApi, VehiclesResponse } from "../infrastructure/vehicle-api";
import {
  Vehicle,
  isValidPlate,
  normalizePlate,
} from "../domain/model/vehicle.entity";
import { VehicleData } from "../infrastructure/resources";
@Injectable({ providedIn: "root" })
export class VehicleStore extends ResourceStore<
  Vehicle,
  VehicleData,
  VehiclesResponse
> {
  private readonly iam = inject(IamStore);
  constructor() {
    super(inject(VehicleApi));
  }
  loadForUser(): Promise<void> {
    return this.load({ userId: this.iam.user()!.id });
  }
  override async save(vehicle: Vehicle): Promise<Vehicle | null> {
    if (!isValidPlate(vehicle.plate)) {
      this.error.set("vehicle.plateError");
      return null;
    }
    vehicle.plate = normalizePlate(vehicle.plate);
    if (
      this.items().some((v) => v.id !== vehicle.id && v.plate === vehicle.plate)
    ) {
      this.error.set("vehicle.duplicate");
      return null;
    }
    if (!vehicle.id && this.items().length >= 25) {
      this.error.set("vehicle.quota");
      return null;
    }
    vehicle.userId = this.iam.user()!.id;
    return super.save(vehicle);
  }
}
