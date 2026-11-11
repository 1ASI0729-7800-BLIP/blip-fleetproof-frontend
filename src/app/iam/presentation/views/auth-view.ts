import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { BaseForm } from "../../../shared/presentation/components/base-form";
import { LanguageSwitcher } from "../../../shared/presentation/components/language-switcher";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { AccountType } from "../../domain/model/user.entity";
import { IamStore } from "../../application/iam.store";

/**
 * @description Authentication view component handling both Sign-In and Sign-Up flows.
 * Uses reactive forms and interacts directly with the IAM Store.
 *
 * @author Gonzalo Samuel Quintanilla Pozo
 */
@Component({
  imports: [...UI_IMPORTS, ReactiveFormsModule, RouterLink, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="login-page">
      <section class="auth-panel">
        <app-language-switcher />

        <div class="brand">
          <span class="brand-logo"><img src="assets/fleetproof-logo.png" alt="FleetProof" /></span>
        </div>

        <h1>{{ (register ? "auth.newAccount" : "auth.signIn") | translate }}</h1>
        <p class="muted">{{ "auth.welcome" | translate }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          @if (register) {
            <mat-form-field appearance="outline">
              <mat-label>{{ "common.name" | translate }}</mat-label>
              <input matInput formControlName="name" autocomplete="name" />
              <mat-error>{{ "common.required" | translate }}</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>{{ "auth.accountType" | translate }}</mat-label>
              <mat-select formControlName="accountType" (selectionChange)="setAccountType($event.value)">
                <mat-option value="personal">{{ "auth.personal" | translate }}</mat-option>
                <mat-option value="company">{{ "auth.company" | translate }}</mat-option>
              </mat-select>
              <mat-error>{{ "common.required" | translate }}</mat-error>
            </mat-form-field>
            @if (form.controls.accountType.value === "company") {
            <mat-form-field appearance="outline">
              <mat-label>{{ "common.organization" | translate }}</mat-label>
              <input matInput formControlName="organization" autocomplete="organization" />
              <mat-error>{{ "common.required" | translate }}</mat-error>
            </mat-form-field>
            }
          }

          <mat-form-field appearance="outline">
            <mat-label>{{ "common.email" | translate }}</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email" />
            <mat-error>{{ "common.invalid" | translate }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ "common.password" | translate }}</mat-label>
            <input
              matInput
              formControlName="password"
              type="password"
              [attr.autocomplete]="register ? 'new-password' : 'current-password'"
            />
            <mat-error>{{ "auth.passwordRule" | translate }}</mat-error>
          </mat-form-field>

          @if (store.error()) {
            <p class="error" role="alert">{{ store.error()! | translate }}</p>
          }

          <button mat-flat-button type="submit" [disabled]="store.busy()">
            {{ (store.busy() ? "common.loading" : register ? "auth.signUp" : "auth.signIn") | translate }}
          </button>
        </form>

        <p class="auth-foot">
          {{ (register ? "auth.hasAccount" : "auth.noAccount") | translate }}
          <a [routerLink]="register ? '/sign-in' : '/sign-up'">
            {{ (register ? "auth.signIn" : "auth.signUp") | translate }}
          </a>
        </p>

      </section>
    </div>
  `,
})
export class AuthView extends BaseForm {
  readonly store = inject(IamStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  /**
   * @description Determines if the current view is for registration based on route data.
   */
  readonly register = !!this.route.snapshot.data["register"];

  /**
   * @description Reactive form configuration with dynamic validation rules.
   */
  readonly form = this.fb.nonNullable.group({
    name: [
      "",
      this.register ? [Validators.required, Validators.pattern(/\S/)] : [],
    ],
    accountType: this.fb.nonNullable.control<AccountType | "">(
      "", this.register ? Validators.required : [],
    ),
    organization: [""],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(8)]],
  });

  /**
   * @description Submits the form, authenticates or registers the user, and handles redirection.
   * @returns {Promise<void>}
   */
  setAccountType(type: AccountType): void {
    const organization = this.form.controls.organization;
    organization.setValidators(type === "company" ? [Validators.required, Validators.pattern(/\S/)] : []);
    organization.updateValueAndValidity();
  }

  async submit(): Promise<void> {
    if (!this.validateForm(this.form)) {
      return;
    }

    const { accountType, ...data } = this.form.getRawValue();
    if (this.register && !accountType) return;
    const ok = this.register && accountType
      ? await this.store.register({ ...data, accountType })
      : await this.store.signIn(data);

    if (ok) {
      const target = this.route.snapshot.queryParamMap.get("returnUrl");
      await this.router.navigateByUrl(
        target && target.startsWith("/") && !target.startsWith("//")
          ? target
          : "/dashboard",
      );
    }
  }
}
