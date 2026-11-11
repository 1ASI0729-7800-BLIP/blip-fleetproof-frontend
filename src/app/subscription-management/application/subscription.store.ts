import { Injectable, computed, inject } from "@angular/core";
import { IamStore } from "../../iam/application/iam.store";
import { ResourceStore } from "../../shared/application/resource.store";
import { Subscription } from "../domain/model/subscription.entity";
import { SubscriptionApi, SubscriptionData, SubscriptionsResponse } from "../infrastructure/subscription-api";

@Injectable()
export class SubscriptionStore extends ResourceStore<Subscription, SubscriptionData, SubscriptionsResponse> {
  private readonly iam = inject(IamStore);
  readonly current = computed(() => {
    const userId = this.iam.user()?.id;
    const subscriptions = this.items().filter((item) => item.userId === userId);
    return subscriptions.find((item) => item.active) ?? subscriptions[0];
  });

  constructor() {
    super(inject(SubscriptionApi));
  }

  loadForUser(): Promise<void> {
    const userId = this.iam.user()?.id;
    return userId === undefined ? Promise.resolve() : this.load({ userId });
  }
}
