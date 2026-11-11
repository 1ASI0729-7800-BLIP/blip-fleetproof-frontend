import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { IamStore } from "../application/iam.store";

/**
 * @description Route guard that prevents unauthorized access.
 * Redirects unauthenticated users to the sign-in page, preserving the return URL.
 *
 * @author Gonzalo Samuel Quintanilla Pozo
 */
export const iamGuard: CanActivateFn = (_route, state) =>
  inject(IamStore).user()
    ? true
    : inject(Router).createUrlTree(["/sign-in"], {
      queryParams: { returnUrl: state.url },
    });
