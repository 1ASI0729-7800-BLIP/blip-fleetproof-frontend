import { BaseEntity } from "../../../shared/domain/model/base-entity";

export class Fleet implements BaseEntity {
  #id: number;
  get id(): number {
    return this.#id;
  }
  #userId: number;
  get userId(): number {
    return this.#userId;
  }
  set userId(value: number) {
    this.#userId = value;
  }
  #name: string;
  get name(): string {
    return this.#name;
  }
  constructor(id: number, userId: number, name: string) {
    this.#id = id;
    this.#userId = userId;
    this.#name = name;
  }
}

export class ResolutionCase implements BaseEntity {
  #id: number;
  get id(): number {
    return this.#id;
  }
  #userId: number;
  get userId(): number {
    return this.#userId;
  }
  set userId(value: number) {
    this.#userId = value;
  }
  #vehicleId: number;
  get vehicleId(): number {
    return this.#vehicleId;
  }
  #reportId: number | null;
  get reportId(): number | null {
    return this.#reportId;
  }
  #findingId: string;
  get findingId(): string {
    return this.#findingId;
  }
  #title: string;
  get title(): string {
    return this.#title;
  }
  #responsible: string;
  get responsible(): string {
    return this.#responsible;
  }
  #dueDate: string;
  get dueDate(): string {
    return this.#dueDate;
  }
  #status: "open" | "in-progress" | "resolved";
  get status(): "open" | "in-progress" | "resolved" {
    return this.#status;
  }
  #evidence: string;
  get evidence(): string {
    return this.#evidence;
  }
  #notes: string;
  get notes(): string {
    return this.#notes;
  }
  #createdAt: string;
  get createdAt(): string {
    return this.#createdAt;
  }
  constructor(
    id: number,
    userId: number,
    vehicleId: number,
    reportId: number | null,
    findingId: string,
    title: string,
    responsible: string,
    dueDate: string,
    status: "open" | "in-progress" | "resolved",
    evidence: string,
    notes: string,
    createdAt: string,
  ) {
    this.#id = id;
    this.#userId = userId;
    this.#vehicleId = vehicleId;
    this.#reportId = reportId;
    this.#findingId = findingId;
    this.#title = title;
    this.#responsible = responsible;
    this.#dueDate = dueDate;
    this.#status = status;
    this.#evidence = evidence;
    this.#notes = notes;
    this.#createdAt = createdAt;
  }
  get canResolve(): boolean {
    return this.evidence.trim().length > 0;
  }
  recordEvidence(reference: string): void {
    this.#evidence = reference.trim();
  }
}
