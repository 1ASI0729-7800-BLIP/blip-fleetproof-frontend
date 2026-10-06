import { BaseForm } from "../../../shared/presentation/components/base-form";
import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { LanguageSwitcher } from "../../../shared/presentation/components/language-switcher";
import { IamStore } from "../../application/iam.store";
@Component({
  imports: [...UI_IMPORTS, ReactiveFormsModule, RouterLink, LanguageSwitcher],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ` <div class="login-page">
    <section class="auth-panel">
      <app-language-switcher />
      <div class="brand">
        <lucide-icon name="shield-check" size="30" /><span
          >Fleet<span class="brand-accent">Proof</span><small>BLIP</small></span
        >
      </div>
      <h1>{{ (register ? "auth.newAccount" : "auth.signIn") | translate }}</h1>
      <p class="muted">{{ "auth.welcome" | translate }}</p>
      <form [formGroup]="form" (ngSubmit)="submit()">
        @if (register) {
          <mat-form-field appearance="outline"
            ><mat-label>{{ "common.name" | translate }}</mat-label
            ><input
              matInput
              formControlName="name"
              autocomplete="name"
            /><mat-error>{{
              "common.required" | translate
            }}</mat-error></mat-form-field
          >
          <mat-form-field appearance="outline"
            ><mat-label>{{ "common.organization" | translate }}</mat-label
            ><input
              matInput
              formControlName="organization"
              autocomplete="organization"
            /><mat-error>{{
              "common.required" | translate
            }}</mat-error></mat-form-field
          >
        }
        <mat-form-field appearance="outline"
          ><mat-label>{{ "common.email" | translate }}</mat-label
          ><input
            matInput
            formControlName="email"
            type="email"
            autocomplete="email"
          /><mat-error>{{
            "common.invalid" | translate
          }}</mat-error></mat-form-field
        >
        <mat-form-field appearance="outline"
          ><mat-label>{{ "common.password" | translate }}</mat-label
          ><input
            matInput
            formControlName="password"
            type="password"
            [attr.autocomplete]="register ? 'new-password' : 'current-password'"
          /><mat-error>{{
            "auth.passwordRule" | translate
          }}</mat-error></mat-form-field
        >
        @if (store.error()) {
          <p class="error" role="alert">{{ store.error()! | translate }}</p>
        }
        <button mat-flat-button type="submit" [disabled]="store.busy()">
          {{
            (store.busy()
              ? "common.loading"
              : register
                ? "auth.signUp"
                : "auth.signIn"
            ) | translate
          }}
        </button>
      </form>
      <p class="auth-foot">
        {{ (register ? "auth.hasAccount" : "auth.noAccount") | translate }}
        <a [routerLink]="register ? '/sign-in' : '/sign-up'">{{
          (register ? "auth.signIn" : "auth.signUp") | translate
        }}</a>
      </p>
      @if (!register) {
        <p class="notice">{{ "auth.demoCredentials" | translate }}</p>
      }
      <p class="muted" style="font-size:11px">
        {{ "auth.demoAuth" | translate }}
      </p>
    </section>
  </div>`,
})
export class AuthView extends BaseForm {
  readonly store = inject(IamStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly register = !!this.route.snapshot.data["register"];
  readonly form = this.fb.nonNullable.group({
    name: [
      "",
      this.register ? [Validators.required, Validators.pattern(/\S/)] : [],
    ],
    organization: [
      "",
      this.register ? [Validators.required, Validators.pattern(/\S/)] : [],
    ],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(8)]],
  });
  async submit(): Promise<void> {
    if (!this.validateForm(this.form)) {
      return;
    }
    const ok = this.register
      ? await this.store.register(this.form.getRawValue())
      : await this.store.signIn(this.form.getRawValue());
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
