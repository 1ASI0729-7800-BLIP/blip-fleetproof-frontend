import { Component, input, ChangeDetectionStrategy } from "@angular/core";
import { RouterLink } from "@angular/router";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { RiskBadge } from "../../../shared/presentation/components/risk-badge";
import { Vehicle } from "../../domain/model/vehicle.entity";
import { VehicleReport } from "../../../report-management/domain/model/vehicle-report.entity";
@Component({
  selector: "app-vehicle-table",
  imports: [...UI_IMPORTS, RouterLink, RiskBadge],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>{{ "vehicle.plate" | translate }}</th>
          <th>
            {{ "vehicle.brand" | translate }} /
            {{ "vehicle.model" | translate }}
          </th>
          <th>{{ "vehicle.risk" | translate }}</th>
          <th>{{ "common.responsible" | translate }}</th>
          <th>{{ "common.actions" | translate }}</th>
        </tr>
      </thead>
      <tbody>
        @for (v of vehicles(); track v.id) {
          <tr>
            <td>
              <a class="plate" [routerLink]="['/vehicles', v.id]">{{
                v.plate
              }}</a
              ><span class="secondary">{{ v.year }}</span>
            </td>
            <td>
              {{ v.brand }}<span class="secondary">{{ v.model }}</span>
            </td>
            <td><app-risk-badge [risk]="riskFor(v.id)" /></td>
            <td>{{ v.responsible || ("common.unassigned" | translate) }}</td>
            <td>
              <a
                mat-icon-button
                [routerLink]="['/vehicles', v.id]"
                [matTooltip]="'common.view' | translate"
                [attr.aria-label]="('common.view' | translate) + ' ' + v.plate"
                ><lucide-icon name="arrow-right" size="18"
              /></a>
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>`,
})
export class VehicleTable {
  vehicles = input<Vehicle[]>([]);
  reports = input<VehicleReport[]>([]);
  riskFor(id: number): string {
    return (
      [...this.reports()]
        .filter((r) => r.vehicleId === id)
        .sort((a, b) => b.version - a.version)[0]?.risk || "unknown"
    );
  }
}
