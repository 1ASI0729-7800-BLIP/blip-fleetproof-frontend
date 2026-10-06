import { BaseEntity } from "../../../shared/domain/model/base-entity";

export class Monitoring implements BaseEntity {
  #id: number;
  get id(): number {
    return this.#id;
  }
  #userId: number;
  get userId(): number {
    return this.#userId;
  }
  #vehicleId: number;
  get vehicleId(): number {
    return this.#vehicleId;
  }
  #status: "active" | "paused";
  get status(): "active" | "paused" {
    return this.#status;
  }
  #lastCycle: string | null;
  get lastCycle(): string | null {
    return this.#lastCycle;
  }
  constructor(
    id: number,
    userId: number,
    vehicleId: number,
    status: "active" | "paused" = "active",
    lastCycle: string | null = null,
  ) {
    this.#id = id;
    this.#userId = userId;
    this.#vehicleId = vehicleId;
    this.#status = status;
    this.#lastCycle = lastCycle;
  }
}

export class Alert implements BaseEntity {
  #id: number;
  get id(): number {
    return this.#id;
  }
  #userId: number;
  get userId(): number {
    return this.#userId;
  }
  #vehicleId: number;
  get vehicleId(): number {
    return this.#vehicleId;
  }
  #reportId: number;
  get reportId(): number {
    return this.#reportId;
  }
  #type: "documentary" | "technical";
  get type(): "documentary" | "technical" {
    return this.#type;
  }
  #status: "open" | "reviewed";
  get status(): "open" | "reviewed" {
    return this.#status;
  }
  #createdAt: string;
  get createdAt(): string {
    return this.#createdAt;
  }
  #messageKey: string;
  get messageKey(): string {
    return this.#messageKey;
  }
  constructor(
    id: number,
    userId: number,
    vehicleId: number,
    reportId: number,
    type: "documentary" | "technical",
    status: "open" | "reviewed",
    createdAt: string,
    messageKey: string,
  ) {
    this.#id = id;
    this.#userId = userId;
    this.#vehicleId = vehicleId;
    this.#reportId = reportId;
    this.#type = type;
    this.#status = status;
    this.#createdAt = createdAt;
    this.#messageKey = messageKey;
  }
}
