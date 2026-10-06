import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { IamStore } from "../application/iam.store";
export const iamGuard: CanActivateFn = (_route, state) =>
  inject(IamStore).user()
    ? true
    : inject(Router).createUrlTree(["/sign-in"], {
        queryParams: { returnUrl: state.url },
      });
