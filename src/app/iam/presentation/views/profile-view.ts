import { BaseForm } from "../../../shared/presentation/components/base-form";
import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { IamStore } from "../../application/iam.store";

/**
 * @description Profile view component for updating user information.
 * @author Gonzalo Samuel Quintanilla Pozo
 */
@Component({
  imports: [...UI_IMPORTS, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="page-heading">
      <div>
        <h1>{{ "nav.profile" | translate }}</h1>
        <p>{{ "auth.profileSubtitle" | translate }}</p>
      </div>
    </div>
    <section class="section" style="max-width:650px">
      <div class="section-body">
        <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ "common.name" | translate }}</mat-label>
            <input matInput formControlName="name" />
            <mat-error>{{ "common.required" | translate }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>{{ "common.organization" | translate }}</mat-label>
            <input matInput formControlName="organization" />
            <mat-error>{{ "common.required" | translate }}</mat-error>
          </mat-form-field>

          <p class="full">
            {{ "common.email" | translate }}: {{ store.user()?.email }}
          </p>

          @if (store.error()) {
            <p class="error full" role="alert">
              {{ store.error()! | translate }}
            </p>
          }

          @if (saved()) {
            <p class="success-text full" role="status">
              {{ "common.saved" | translate }}
            </p>
          }

          <div class="full">
            <button mat-flat-button [disabled]="store.busy()">
              {{ "common.save" | translate }}
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
})
export class ProfileView extends BaseForm {
  readonly store = inject(IamStore);

  /** @description Signal indicating if the profile was successfully saved. */
  readonly saved = signal(false);

  /** @description Reactive form configuration for the user profile. */
  readonly form = inject(FormBuilder).nonNullable.group({
    name: [
      this.store.user()?.name || "",
      [Validators.required, Validators.pattern(/\S/)],
    ],
    organization: [
      this.store.user()?.organization || "",
      [Validators.required, Validators.pattern(/\S/)],
    ],
  });

  /**
   * @description Validates the form and attempts to save the updated profile.
   * @returns {Promise<void>}
   */
  async save(): Promise<void> {
    if (!this.validateForm(this.form)) {
      return;
    }
    this.saved.set(
      await this.store.update(
        this.form.getRawValue().name,
        this.form.getRawValue().organization,
      ),
    );
  }
}
