import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { BaseApiEndpoint } from "../../shared/infrastructure/base-api-endpoint";
import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import { BaseResource, BaseResponse } from "../../shared/infrastructure/base-response";
import { Subscription } from "../domain/model/subscription.entity";

export interface SubscriptionData extends BaseResource {
  userId: number;
  plan: string;
  vehicleLimit: number;
  status: string;
}

export interface SubscriptionsResponse extends BaseResponse {
  subscriptions: SubscriptionData[];
}

class SubscriptionAssembler implements BaseAssembler<Subscription, SubscriptionData, SubscriptionsResponse> {
  toEntityFromResource(data: SubscriptionData): Subscription {
    return new Subscription(data.id, data.userId, data.plan, data.vehicleLimit, data.status);
  }

  toResourceFromEntity(subscription: Subscription): SubscriptionData {
    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      vehicleLimit: subscription.vehicleLimit,
      status: subscription.status,
    };
  }

  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[] {
    return response.subscriptions.map((data) => this.toEntityFromResource(data));
  }
}

@Injectable({ providedIn: "root" })
export class SubscriptionApi extends BaseApiEndpoint<Subscription, SubscriptionData, SubscriptionsResponse> {
  constructor() {
    super(
      inject(HttpClient),
      environment.platformProviderApiBaseUrl + environment.platformProviderSubscriptionsEndpointPath,
      new SubscriptionAssembler(),
    );
  }
}
