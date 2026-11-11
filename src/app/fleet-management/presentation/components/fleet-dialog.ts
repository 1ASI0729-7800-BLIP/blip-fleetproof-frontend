import { BaseForm } from "../../../shared/presentation/components/base-form";
import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { FleetStore } from "../../application/fleet.store";
@Component({
  imports: [...UI_IMPORTS, MatDialogModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <h2 mat-dialog-title>{{ "vehicle.createFleet" | translate }}</h2>
    <mat-dialog-content
      ><form id="fleet-form" [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" style="width:100%;margin-top:8px"
          ><mat-label>{{ "vehicle.fleetName" | translate }}</mat-label
          ><input matInput formControlName="name" /><mat-error>{{
            "common.required" | translate
          }}</mat-error></mat-form-field
        >
        @if (store.error()) {
          <p class="error" role="alert">{{ store.error()! | translate }}</p>
        }
      </form></mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button (click)="ref.close()" [disabled]="store.saving()">
        {{ "common.cancel" | translate }}</button
      ><button
        mat-flat-button
        type="submit"
        form="fleet-form"
        [disabled]="store.saving()"
      >
        {{ "common.save" | translate }}
      </button></mat-dialog-actions
    >`,
})
export class FleetDialog extends BaseForm {
  readonly store = inject(FleetStore);
  readonly ref = inject(MatDialogRef<FleetDialog>);
  readonly form = inject(FormBuilder).nonNullable.group({
    name: ["", [Validators.required, Validators.pattern(/\S/)]],
  });
  constructor() {
    super();
    this.store.error.set(null);
  }
  async save(): Promise<void> {
    if (!this.validateForm(this.form)) {
      return;
    }
    const fleet = await this.store.create(this.form.getRawValue().name);
    if (fleet) this.ref.close(fleet);
  }
}
