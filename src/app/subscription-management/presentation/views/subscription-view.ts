import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { IamStore } from "../../../iam/application/iam.store";
import { UI_IMPORTS } from "../../../shared/presentation/ui-imports";
import { VehicleStore } from "../../../vehicle-information/application/vehicle.store";
import { SubscriptionStore } from "../../application/subscription.store";

@Component({
  imports: [...UI_IMPORTS],
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
        } @else if (store.error()) {
          <p role="alert">{{ "common.loadError" | translate }}</p>
          <button mat-stroked-button (click)="load()">{{ "common.retry" | translate }}</button>
        } @else if (store.current(); as subscription) {
          <dl>
            <dt>{{ "subscription.plan" | translate }}</dt>
            <dd>{{ subscription.plan === "demo" ? ("common.demo" | translate) : subscription.plan }}</dd>
            <dt>{{ "subscription.status" | translate }}</dt>
            <dd>{{ (subscription.active ? "subscription.active" : "subscription.inactive") | translate }}</dd>
            <dt>{{ "subscription.vehicleLimit" | translate }}</dt>
            <dd>{{ subscription.vehicleLimit | number }}</dd>
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
          </dl>
        } @else {
          <p role="status">{{ "subscription.empty" | translate }}</p>
        }
      </div>
    </section>
  `,
  styles: [`
    dl { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: .5rem 1rem; margin: 0; }
    dt { font-weight: 600; }
    progress { display: block; width: 100%; margin-block-start: .5rem; accent-color: #087f8c; }
    dd { margin: 0 0 .75rem; overflow-wrap: anywhere; }
  `],
})
export class SubscriptionView {
  readonly store = inject(SubscriptionStore);
  readonly vehicles = inject(VehicleStore);
  private readonly iam = inject(IamStore);
  readonly vehicleCount = computed(() =>
    this.vehicles.items().filter((vehicle) => vehicle.userId === this.iam.user()?.id).length,
  );

  constructor() {
    this.load();
  }

  load(): void {
    if (!this.iam.user()) return;
    void this.store.loadForUser();
    void this.vehicles.loadForUser();
  }
}
