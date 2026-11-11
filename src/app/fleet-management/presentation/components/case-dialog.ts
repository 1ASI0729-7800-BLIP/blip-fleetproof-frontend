import { BaseForm } from "../../../shared/presentation/components/base-form";
import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { IamStore } from "../../../iam/application/iam.store";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { CaseStore } from "../../application/fleet.store";
import { ResolutionCase } from "../../domain/model/fleet.entity";
export interface CaseDialogData {
  item?: ResolutionCase;
  vehicleId?: number;
  reportId?: number;
  findingId?: string;
  title?: string;
}
@Component({
  imports: [...UI_IMPORTS, ReactiveFormsModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <h2 mat-dialog-title>
      {{ (data.item ? "cases.resolve" : "cases.create") | translate }}
    </h2>
    <mat-dialog-content
      ><form
        id="case-form"
        [formGroup]="form"
        (ngSubmit)="save()"
        class="form-grid dialog-body"
      >
        <mat-form-field appearance="outline" class="full"
          ><mat-label>{{ "vehicle.plate" | translate }}</mat-label
          ><mat-select formControlName="vehicleId">
            @for (v of vehicles.items(); track v.id) {
              <mat-option [value]="v.id">{{ v.plate }}</mat-option>
            }</mat-select
          ><mat-error>{{
            "common.required" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline" class="full"
          ><mat-label>{{ "cases.title" | translate }}</mat-label
          ><input matInput formControlName="title" /><mat-error>{{
            "common.required" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "common.responsible" | translate }}</mat-label
          ><input matInput formControlName="responsible" /><mat-error>{{
            "common.required" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "cases.due" | translate }}</mat-label
          ><input matInput type="date" formControlName="dueDate"
        /></mat-form-field>
        <mat-form-field appearance="outline" class="full"
          ><mat-label>{{ "common.status" | translate }}</mat-label
          ><mat-select formControlName="status">
            @for (s of statuses; track s) {
              <mat-option [value]="s">{{
                "cases." + s | translate
              }}</mat-option>
            }
          </mat-select></mat-form-field
        >
        <mat-form-field appearance="outline" class="full"
          ><mat-label>{{ "cases.evidence" | translate }}</mat-label
          ><input matInput formControlName="evidence"
        /></mat-form-field>
        <mat-form-field appearance="outline" class="full"
          ><mat-label>{{ "common.notes" | translate }}</mat-label
          ><textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>
        @if (store.error()) {
          <p class="error full" role="alert">
            {{ store.error()! | translate }}
          </p>
        }
      </form></mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button (click)="ref.close()" [disabled]="store.saving()">
        {{ "common.cancel" | translate }}</button
      ><button
        mat-flat-button
        type="submit"
        form="case-form"
        [disabled]="store.saving()"
      >
        {{ "common.save" | translate }}
      </button></mat-dialog-actions
    >`,
})
export class CaseDialog extends BaseForm {
  readonly data = inject<CaseDialogData>(MAT_DIALOG_DATA);
  readonly ref = inject(MatDialogRef<CaseDialog>);
  readonly store = inject(CaseStore);
  readonly vehicles = inject(VehicleStore);
  private readonly iam = inject(IamStore);
  readonly statuses = ["open", "in-progress", "resolved"];
  readonly form = inject(FormBuilder).nonNullable.group({
    vehicleId: [
      this.data.item?.vehicleId || this.data.vehicleId || 0,
      [Validators.required, Validators.min(1)],
    ],
    title: [
      this.data.item?.title || "",
      [Validators.required, Validators.pattern(/\S/)],
    ],
    responsible: [
      this.data.item?.responsible || "",
      [Validators.required, Validators.pattern(/\S/)],
    ],
    dueDate: [this.data.item?.dueDate || ""],
    status: [this.data.item?.status || "open"],
    evidence: [this.data.item?.evidence || ""],
    notes: [this.data.item?.notes || ""],
  });
  constructor() {
    super();
    if (this.data.title) this.form.controls.title.setValue(this.data.title);
    this.store.error.set(null);
    void this.vehicles.loadForUser();
    if (this.data.item || this.data.vehicleId)
      this.form.controls.vehicleId.disable();
  }
  async save(): Promise<void> {
    if (!this.validateForm(this.form)) {
      return;
    }
    const v = this.form.getRawValue();
    const old = this.data.item;
    const item = new ResolutionCase(
      old?.id || 0,
      this.iam.user()!.id,
      v.vehicleId,
      old?.reportId ?? this.data.reportId ?? null,
      old?.findingId || this.data.findingId || "",
      v.title.trim(),
      v.responsible.trim(),
      v.dueDate,
      v.status,
      v.evidence.trim(),
      v.notes.trim(),
      old?.createdAt || new Date().toISOString(),
    );
    const saved = await this.store.save(item);
    if (saved) this.ref.close(saved);
  }
}
