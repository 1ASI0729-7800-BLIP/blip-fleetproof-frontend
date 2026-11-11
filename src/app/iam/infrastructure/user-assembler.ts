import { User } from "../domain/model/user.entity";
import { BaseAssembler } from "../../shared/infrastructure/base-assembler";
import {
  BaseResource,
  BaseResponse,
} from "../../shared/infrastructure/base-response";

/**
 * @description API resource representation of a User.
 */
export interface UserResource extends BaseResource {
  name: string;
  email: string;
  organization: string;
  passwordHash?: string;
}

/**
 * @description API response containing a list of User resources.
 */
export interface UsersResponse extends BaseResponse {
  users: UserResource[];
}

/**
 * @description Assembler for User entity, handling transformations between domain entities and API resources.
 * @author Gonzalo Samuel Quintanilla Pozo
 */
export class UserAssembler implements BaseAssembler<
  User,
  UserResource,
  UsersResponse
> {
  /**
   * @param {UserResource} r
   * @returns {User}
   */
  toEntityFromResource(r: UserResource): User {
    return new User(r.id, r.name, r.email, r.organization);
  }

  /**
   * @param {User} u
   * @returns {UserResource}
   */
  toResourceFromEntity(u: User): UserResource {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      organization: u.organization,
    };
  }

  /**
   * @param {UsersResponse} r
   * @returns {User[]}
   */
  toEntitiesFromResponse(r: UsersResponse): User[] {
    return r.users.map((u) => this.toEntityFromResource(u));
  }
}
