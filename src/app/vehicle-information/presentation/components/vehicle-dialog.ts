import { BaseForm } from "../../../shared/presentation/components/base-form";
import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { Vehicle } from "../../domain/model/vehicle.entity";
import { VehicleStore } from "../../application/vehicle.store";
import { IamStore } from "../../../iam/application/iam.store";
import { FleetStore } from "../../../fleet-management/application/fleet.store";
@Component({
  imports: [...UI_IMPORTS, MatDialogModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <h2 mat-dialog-title>
      {{ (data ? "vehicle.edit" : "vehicle.add") | translate }}
    </h2>
    <mat-dialog-content
      ><form
        id="vehicle-form"
        [formGroup]="form"
        (ngSubmit)="save()"
        class="form-grid dialog-body"
      >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "vehicle.plate" | translate }}</mat-label
          ><input matInput formControlName="plate" maxlength="7" /><mat-error>{{
            "vehicle.plateError" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "vehicle.year" | translate }}</mat-label
          ><input matInput type="number" formControlName="year" /><mat-error>{{
            "common.invalid" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "vehicle.brand" | translate }}</mat-label
          ><input matInput formControlName="brand" /><mat-error>{{
            "common.required" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "vehicle.model" | translate }}</mat-label
          ><input matInput formControlName="model" /><mat-error>{{
            "common.required" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline" class="full"
          ><mat-label>{{ "common.responsible" | translate }}</mat-label
          ><input matInput formControlName="responsible"
        /></mat-form-field>
        <mat-form-field appearance="outline" class="full"
          ><mat-label>{{ "vehicle.fleet" | translate }}</mat-label
          ><mat-select formControlName="fleetId"
            ><mat-option [value]="0">{{
              "common.unassigned" | translate
            }}</mat-option>
            @for (f of fleets.items(); track f.id) {
              <mat-option [value]="f.id">{{ f.name }}</mat-option>
            }
          </mat-select></mat-form-field
        >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "vehicle.vin" | translate }}</mat-label
          ><input matInput formControlName="vin" maxlength="17"
        /></mat-form-field>
        <mat-form-field appearance="outline"
          ><mat-label>{{ "vehicle.owner" | translate }}</mat-label
          ><input matInput formControlName="owner"
        /></mat-form-field>
        @if (store.error()) {
          <p class="full error" role="alert">
            {{ store.error()! | translate }}
          </p>
        }
      </form></mat-dialog-content
    >
    <mat-dialog-actions align="end"
      ><button mat-button (click)="ref.close()" [disabled]="store.saving()">
        {{ "common.cancel" | translate }}</button
      ><button
        mat-flat-button
        type="submit"
        form="vehicle-form"
        [disabled]="store.saving()"
      >
        {{ "common.save" | translate }}
      </button></mat-dialog-actions
    >`,
})
export class VehicleDialog extends BaseForm {
  readonly data = inject<Vehicle | null>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<VehicleDialog>);
  readonly store = inject(VehicleStore);
  private readonly iam = inject(IamStore);
  readonly fleets = inject(FleetStore);
  readonly form = inject(FormBuilder).nonNullable.group({
    fleetId: [this.data?.fleetId || 0],
    plate: [
      this.data?.plate || "",
      [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]{3}-?[A-Za-z0-9]{3}$/),
      ],
    ],
    brand: [
      this.data?.brand || "",
      [Validators.required, Validators.pattern(/\S/)],
    ],
    model: [
      this.data?.model || "",
      [Validators.required, Validators.pattern(/\S/)],
    ],
    year: [
      this.data?.year || 2026,
      [
        Validators.required,
        Validators.min(1950),
        Validators.max(new Date().getFullYear() + 1),
      ],
    ],
    responsible: [this.data?.responsible || ""],
    vin: [this.data?.vin || ""],
    owner: [this.data?.owner || ""],
  });
  constructor() {
    super();
    this.store.error.set(null);
    void this.fleets.loadForUser();
  }
  async save(): Promise<void> {
    if (!this.validateForm(this.form)) {
      return;
    }
    const v = this.form.getRawValue();
    const fleetId = Number(this.form.get("fleetId")?.value || 0);
    const saved = await this.store.save(
      new Vehicle(
        this.data?.id || 0,
        this.iam.user()!.id,
        fleetId,
        v.plate,
        v.brand.trim(),
        v.model.trim(),
        v.year,
        v.responsible.trim(),
        v.vin,
        v.owner,
      ),
    );
    if (saved) this.ref.close(saved);
  }
}
