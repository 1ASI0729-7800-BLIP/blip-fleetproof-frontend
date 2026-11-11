import { Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Credentials, Registration, User } from "../domain/model/user.entity";
import { IamApi } from "../infrastructure/iam-api";

/**
 * @description IAM Store for FleetProof. Manages user state and authentication.
 * @author Gonzalo Samuel Quintanilla Pozo
 */
@Injectable({ providedIn: "root" })
export class IamStore {
  private readonly api = inject(IamApi);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(this.restore());
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * @param {Credentials} data
   * @returns {Promise<boolean>}
   */
  async signIn(data: Credentials): Promise<boolean> {
    if (this.busy()) return false;
    this.busy.set(true);
    this.error.set(null);
    try {
      const user = await this.api.signIn(data);
      if (!user) {
        this.error.set("auth.invalidCredentials");
        return false;
      }
      this.persist(user);
      return true;
    } catch {
      this.error.set("common.loadError");
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  /**
   * @param {Registration} data
   * @returns {Promise<boolean>}
   */
  async register(data: Registration): Promise<boolean> {
    if (this.busy()) return false;
    this.busy.set(true);
    this.error.set(null);
    try {
      this.persist(await this.api.register(data));
      return true;
    } catch (error) {
      this.error.set(
        error instanceof Error && error.message === "auth.emailTaken"
          ? "auth.emailTaken"
          : "common.saveError",
      );
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  /**
   * @param {string} name
   * @param {string} organization
   * @returns {Promise<boolean>}
   */
  async update(name: string, organization: string): Promise<boolean> {
    const current = this.user();
    if (!current || this.busy()) return false;
    this.busy.set(true);
    this.error.set(null);
    try {
      this.persist(
        await this.api.update(
          new User(current.id, name, current.email, organization),
        ),
      );
      return true;
    } catch {
      this.error.set("common.saveError");
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  signOut(): void {
    sessionStorage.removeItem("fleetproof.user");
    this.user.set(null);
    void this.router.navigateByUrl("/sign-in");
  }

  private persist(user: User): void {
    this.user.set(user);
    sessionStorage.setItem(
      "fleetproof.user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
      }),
    );
  }

  private restore(): User | null {
    try {
      const raw = JSON.parse(
        sessionStorage.getItem("fleetproof.user") || "null",
      );
      return raw &&
      Number.isInteger(raw.id) &&
      raw.id > 0 &&
      typeof raw.email === "string"
        ? new User(raw.id, raw.name, raw.email, raw.organization)
        : null;
    } catch {
      return null;
    }
  }
}
