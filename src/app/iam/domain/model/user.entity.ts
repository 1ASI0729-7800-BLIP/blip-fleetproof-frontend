import { BaseEntity } from "../../../shared/domain/model/base-entity";

/**
 * @description Represents a User entity in the domain model.
 * @author Gonzalo Samuel Quintanilla Pozo
 */
export class User implements BaseEntity {
  #id: number;
  get id(): number {
    return this.#id;
  }

  #name: string;
  get name(): string {
    return this.#name;
  }

  #email: string;
  get email(): string {
    return this.#email;
  }

  #organization: string;
  get organization(): string {
    return this.#organization;
  }

  /**
   * @param {number} id
   * @param {string} name
   * @param {string} email
   * @param {string} organization
   */
  constructor(id: number, name: string, email: string, organization: string) {
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#organization = organization;
  }
}

/**
 * @description Required credentials for user authentication.
 */
export interface Credentials {
  email: string;
  password: string;
}

/**
 * @description Data transfer object for new user registration.
 */
export interface Registration extends Credentials {
  name: string;
  organization: string;
}
