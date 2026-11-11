import { ChangeDetectionStrategy, Component, computed, inject, signal, TemplateRef, viewChild } from "@angular/core";
import { MatDialog, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { toDataURL } from "qrcode";
import { IamStore } from "../../../iam/application/iam.store";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { fleetPlans, individualPlans, MonitoringPlan } from "../../domain/model/monitoring-plan";
import { SubscriptionStore } from "../../application/subscription.store";

@Component({
  imports: [...UI_IMPORTS, MatDialogModule],
  providers: [SubscriptionStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-heading">
      <div>
        <h1>{{ "nav.subscription" | translate }}</h1>
        <p>{{ "subscription.subtitle" | translate }}</p>
      </div>
    </div>
    <section class="section" [attr.aria-label]="'nav.subscription' | translate">
      <div class="section-body">
        @if (store.loading()) {
          <p role="status">{{ "common.loading" | translate }}</p>
        } @else if (store.error() === "common.loadError") {
          <p role="alert">{{ "common.loadError" | translate }}</p>
          <button mat-stroked-button (click)="load()">{{ "common.retry" | translate }}</button>
        } @else if (store.current(); as subscription) {
          <dl>
            <dt>{{ "subscription.plan" | translate }}</dt>
            <dd>{{ planLabel(subscription.plan) | translate }}</dd>
            @if (subscription.amount !== undefined) {
              <dt>{{ "subscription.amount" | translate }}</dt>
              <dd>S/ {{ subscription.amount | number }}</dd>
            }
            <dt>{{ "subscription.status" | translate }}</dt>
            <dd>{{ (subscription.active ? "subscription.active" : "subscription.inactive") | translate }}</dd>
            <dt>{{ "subscription.vehicleLimit" | translate }}</dt>
            <dd>{{ subscription.vehicleLimit | number }}</dd>
            @if (subscription.plan === "demo") {
            <dt>{{ "subscription.usage" | translate }}</dt>
            <dd>
              @if (vehicles.loading()) {
                <span role="status">{{ "common.loading" | translate }}</span>
              } @else if (vehicles.error()) {
                <span role="alert">{{ "common.loadError" | translate }}</span>
                <button mat-button (click)="load()">{{ "common.retry" | translate }}</button>
              } @else {
                <strong>{{ "subscription.usageValue" | translate: { used: vehicleCount(), limit: subscription.vehicleLimit } }}</strong>
                @if (subscription.vehicleLimit > 0) {
                  <progress [value]="vehicleCount()" [max]="subscription.vehicleLimit"
                    [attr.aria-label]="'subscription.usage' | translate"></progress>
                }
              }
            </dd>
            }
          </dl>
        } @else {
          <p role="status">{{ "subscription.empty" | translate }}</p>
        }
      </div>
    </section>
    <section class="plans" aria-labelledby="monitoring-plans">
      <h2 id="monitoring-plans">{{ (company() ? "subscription.fleetPlans" : "subscription.individualPlans") | translate }}</h2>
      <div class="plan-grid">
        @for (plan of plans(); track plan.frequency) {
          <article class="plan-card">
            <h3>{{ ("subscription." + plan.frequency) | translate }}</h3>
            <p><strong>S/ {{ plan.amount | number }}</strong> · {{ ("subscription.period." + plan.frequency) | translate }}</p>
            <p>{{ "subscription.capacity" | translate: { limit: plan.vehicleLimit } }}</p>
            <button mat-flat-button type="button" (click)="openPayment(plan)"
              [disabled]="generatingQr() || store.loading() || store.error() === 'common.loadError' || store.saving()">
              {{ "subscription.choosePlan" | translate }}
            </button>
          </article>
        }
      </div>
      @if (qrError()) {
        <p role="alert">{{ "subscription.qrError" | translate }}</p>
      }
      @if (activated()) {
        <p role="status">{{ "subscription.activated" | translate }}</p>
      }
    </section>

    <ng-template #payment>
      @if (paymentPlan(); as plan) {
        <h2 mat-dialog-title>{{ "subscription.paymentTitle" | translate }}</h2>
        <mat-dialog-content>
          <p>{{ "subscription.simulation" | translate }}</p>
          <p><strong>S/ {{ plan.amount | number }}</strong> · {{ ("subscription." + plan.frequency) | translate }}
            ({{ ("subscription.period." + plan.frequency) | translate }})</p>
          <img class="payment-qr" [src]="qr()" width="220" height="220"
            [alt]="'subscription.qrAlt' | translate" />
          @if (store.error() === "common.saveError") {
            <p role="alert">{{ "common.saveError" | translate }}</p>
          }
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="cancelPayment()" [disabled]="store.saving()">
            {{ "subscription.cancelPayment" | translate }}
          </button>
          <button mat-flat-button type="button" (click)="confirmPayment()" [disabled]="store.saving()">
            {{ (store.saving() ? "common.loading" : "subscription.confirmPayment") | translate }}
          </button>
        </mat-dialog-actions>
      }
    </ng-template>
  `,
  styles: [`
    dl { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: .5rem 1rem; margin: 0; }
    dt { font-weight: 600; }
    progress { display: block; width: 100%; margin-block-start: .5rem; accent-color: #087f8c; }
    .plans { margin-block-start: 1.5rem; }
    .plan-grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); }
    .plan-card { padding: 1rem; border: 1px solid #dce6ec; border-radius: .75rem; background: white; }
    .plan-card h3 { margin-block-start: 0; }
    .plan-card strong { font-size: 1.35rem; }
    .payment-qr { display: block; margin: 1rem auto; max-width: 100%; height: auto; }
    dd { margin: 0 0 .75rem; overflow-wrap: anywhere; }
  `],
})
export class SubscriptionView {
  readonly store = inject(SubscriptionStore);
  readonly vehicles = inject(VehicleStore);
  private readonly iam = inject(IamStore);
  private readonly dialog = inject(MatDialog);
  private readonly payment = viewChild.required<TemplateRef<unknown>>("payment");
  private paymentRef?: MatDialogRef<unknown>;
  readonly paymentPlan = signal<MonitoringPlan | null>(null);
  readonly qr = signal("");
  readonly generatingQr = signal(false);
  readonly qrError = signal(false);
  readonly activated = signal(false);
  readonly company = computed(() => this.iam.user()?.accountType === "company");
  readonly plans = computed(() => this.company() ? fleetPlans : individualPlans);
  readonly vehicleCount = computed(() =>
    this.vehicles.items().filter((vehicle) => vehicle.userId === this.iam.user()?.id).length,
  );

  constructor() {
    this.load();
  }

  planLabel(plan: string): string {
    if (plan === "demo") return "common.demo";
    return individualPlans.some((option) => option.frequency === plan)
      ? "subscription." + plan
      : plan;
  }

  async openPayment(plan: MonitoringPlan): Promise<void> {
    if (this.generatingQr() || this.paymentRef || this.store.saving()) return;
    this.generatingQr.set(true);
    this.qrError.set(false);
    this.activated.set(false);
    try {
      this.qr.set(await toDataURL(JSON.stringify({
        type: "FleetProof simulated monitoring payment",
        frequency: plan.frequency,
        currency: "PEN",
        amount: plan.amount,
      }), { width: 220, margin: 4 }));
      this.paymentPlan.set(plan);
      this.paymentRef = this.dialog.open(this.payment(), {
        width: "440px",
        maxWidth: "95vw",
        disableClose: true,
      });
    } catch {
      this.qrError.set(true);
    } finally {
      this.generatingQr.set(false);
    }
  }

  cancelPayment(): void {
    if (this.store.saving()) return;
    this.store.error.set(null);
    this.closePayment();
  }

  async confirmPayment(): Promise<void> {
    const plan = this.paymentPlan();
    if (plan && await this.store.activate(plan)) {
      this.activated.set(true);
      this.closePayment();
    }
  }

  private closePayment(): void {
    this.paymentRef?.close();
    this.paymentRef = undefined;
  }

  load(): void {
    if (!this.iam.user()) return;
    void this.store.loadForUser();
    void this.vehicles.loadForUser();
  }
}
