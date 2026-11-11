import { Injectable, inject } from "@angular/core";
import { IamStore } from "../../iam/application/iam.store";
import { VehicleStore } from "../../vehicle-information/application/vehicle.store";
import { Vehicle } from "../../vehicle-information/domain/model/vehicle.entity";
import { ImportRow } from "../domain/model/csv-import";
@Injectable({ providedIn: "root" })
export class CsvImportService {
  private readonly vehicles = inject(VehicleStore);
  private readonly iam = inject(IamStore);
  async import(
    rows: ImportRow[],
    fleetId: number,
  ): Promise<{ count: number; complete: boolean }> {
    let count = 0;
    for (const row of rows) {
      const saved = await this.vehicles.save(
        new Vehicle(
          0,
          this.iam.user()!.id,
          fleetId,
          row.plate,
          row.brand,
          row.model,
          row.year,
          row.responsible,
        ),
      );
      if (!saved) return { count, complete: false };
      count++;
    }
    return { count, complete: true };
  }
}
