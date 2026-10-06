import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { StateMessage } from "../../../shared/presentation/components/state-message";
import { LanguageStore } from "../../../shared/application/language.store";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { MonitoringStore } from "../../application/monitoring.store";
import { Monitoring } from "../../domain/model/monitoring.entity";
@Component({
  imports: [...UI_IMPORTS, FormsModule, RouterLink, StateMessage],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="page-heading">
      <div>
        <h1>{{ "nav.monitoring" | translate }}</h1>
        <p>{{ "monitoring.subtitle" | translate }}</p>
      </div>
    </div>
    <div class="notice">{{ "monitoring.technical" | translate }}</div>
    <form class="inline-form" (ngSubmit)="activate()">
      <mat-form-field appearance="outline"
        ><mat-label>{{ "monitoring.selectVehicle" | translate }}</mat-label
        ><mat-select name="vehicle" [(ngModel)]="selected">
          @for (v of vehicles.items(); track v.id) {
            <mat-option [value]="v.id"
              >{{ v.plate }} · {{ v.brand }}</mat-option
            >
          }
        </mat-select></mat-form-field
      ><button
        mat-flat-button
        style="margin-top:6px"
        [disabled]="!selected || store.saving() || store.running() !== null"
      >
        {{ "monitoring.activate" | translate }}
      </button>
    </form>
    @if (store.success()) {
      <p class="success-text" role="status">
        {{ "monitoring.cycleComplete" | translate }}
      </p>
    }
    <section class="section">
      <app-state-message
        [loading]="store.loading() || vehicles.loading()"
        [error]="store.error() || vehicles.error()"
        [empty]="!store.items().length"
        (retry)="load()"
      />
      @if (!store.loading() && !vehicles.loading() && store.items().length) {
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>{{ "vehicle.plate" | translate }}</th>
                <th>{{ "common.status" | translate }}</th>
                <th>{{ "monitoring.lastCycle" | translate }}</th>
                <th>{{ "common.actions" | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (m of store.items(); track m.id) {
                <tr>
                  <td>
                    <a
                      class="plate"
                      [routerLink]="['/vehicles', m.vehicleId]"
                      >{{ plate(m.vehicleId) }}</a
                    >
                  </td>
                  <td>
                    <span
                      [class]="
                        'badge status-' +
                        (m.status === 'active' ? 'complete' : 'unavailable')
                      "
                      >{{ "monitoring." + m.status | translate }}</span
                    >
                  </td>
                  <td>
                    {{
                      m.lastCycle
                        ? language.date(m.lastCycle)
                        : ("monitoring.never" | translate)
                    }}
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        mat-stroked-button
                        [disabled]="store.running() !== null || store.saving()"
                        (click)="store.toggle(m)"
                      >
                        {{
                          (m.status === "active"
                            ? "monitoring.pause"
                            : "monitoring.resume"
                          ) | translate
                        }}</button
                      ><button
                        mat-flat-button
                        [disabled]="
                          m.status !== 'active' ||
                          store.running() !== null ||
                          store.saving()
                        "
                        (click)="cycle(m)"
                      >
                        <lucide-icon name="refresh-cw" size="16" />{{
                          (store.running() === m.id
                            ? "common.loading"
                            : "monitoring.cycle"
                          ) | translate
                        }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>`,
})
export class MonitoringView {
  readonly store = inject(MonitoringStore);
  readonly vehicles = inject(VehicleStore);
  readonly language = inject(LanguageStore);
  selected = 0;
  constructor() {
    void this.load();
  }
  async load(): Promise<void> {
    await Promise.all([this.store.loadForUser(), this.vehicles.loadForUser()]);
  }
  plate(id: number): string {
    return this.vehicles.items().find((v) => v.id === id)?.plate || "—";
  }
  async activate(): Promise<void> {
    if (this.selected) {
      await this.store.activate(this.selected);
      this.selected = 0;
    }
  }
  async cycle(m: Monitoring): Promise<void> {
    const v = this.vehicles.items().find((v) => v.id === m.vehicleId);
    if (v) await this.store.cycle(m, v);
  }
}
