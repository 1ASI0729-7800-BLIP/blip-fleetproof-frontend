import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { BaseApi } from "../../shared/infrastructure/base-api";
import { Credentials, Registration, User } from "../domain/model/user.entity";
import { UserAssembler, UserResource } from "./user-assembler";

/**
 * @description API service for Identity and Access Management (IAM).
 * Handles HTTP requests for authentication, registration, and user management.
 *
 * @author Gonzalo Samuel Quintanilla Pozo
 */
@Injectable({ providedIn: "root" })
export class IamApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly url =
    environment.platformProviderApiBaseUrl +
    environment.platformProviderUsersEndpointPath;
  private readonly assembler = new UserAssembler();

  /**
   * @param {Credentials} credentials
   * @returns {Promise<User | null>}
   */
  async signIn(credentials: Credentials): Promise<User | null> {
    try {
      const user = await firstValueFrom(
        this.http.post<UserResource>(`${this.url}/sign-in`, {
          email: credentials.email.trim().toLowerCase(),
          passwordHash: await this.hash(credentials.password),
        }),
      );
      return this.assembler.toEntityFromResource(user);
    } catch {
      return null;
    }
  }

  /**
   * @param {Registration} data
   * @returns {Promise<User>}
   */
  async register(data: Registration): Promise<User> {
    const email = data.email.trim().toLowerCase();
    try {
      const resource = await firstValueFrom(
        this.http.post<UserResource>(this.url, {
          name: data.name.trim(),
          email,
          organization: data.accountType === "company" ? data.organization.trim() : "",
          accountType: data.accountType,
          passwordHash: await this.hash(data.password),
        }),
      );
      return this.assembler.toEntityFromResource(resource);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "status" in error && error.status === 409)
        throw new Error("auth.emailTaken");
      throw error;
    }
  }

  /**
   * @param {User} user
   * @returns {Promise<User>}
   */
  async update(user: User): Promise<User> {
    const result = await firstValueFrom(
      this.http.patch<UserResource>(this.url + "/" + user.id, {
        name: user.name.trim(),
        organization: user.organization.trim(),
      }),
    );
    return this.assembler.toEntityFromResource(result);
  }

  private async hash(password: string): Promise<string> {
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(password),
    );
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
