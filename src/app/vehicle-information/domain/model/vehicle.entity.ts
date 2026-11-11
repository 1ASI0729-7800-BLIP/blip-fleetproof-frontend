import { BaseEntity } from "../../../shared/domain/model/base-entity";

export class Vehicle implements BaseEntity {
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
  #fleetId: number;
  get fleetId(): number {
    return this.#fleetId;
  }
  #plate: string;
  get plate(): string {
    return this.#plate;
  }
  set plate(value: string) {
    this.#plate = normalizePlate(value);
  }
  #brand: string;
  get brand(): string {
    return this.#brand;
  }
  #model: string;
  get model(): string {
    return this.#model;
  }
  #year: number;
  get year(): number {
    return this.#year;
  }
  #responsible: string;
  get responsible(): string {
    return this.#responsible;
  }
  #vin: string;
  get vin(): string {
    return this.#vin;
  }
  #owner: string;
  get owner(): string {
    return this.#owner;
  }
  constructor(
    id: number,
    userId: number,
    fleetId: number,
    plate: string,
    brand: string,
    model: string,
    year: number,
    responsible: string,
    vin: string = "",
    owner: string = "",
  ) {
    this.#id = id;
    this.#userId = userId;
    this.#fleetId = fleetId;
    this.#plate = plate;
    this.#brand = brand;
    this.#model = model;
    this.#year = year;
    this.#responsible = responsible;
    this.#vin = vin;
    this.#owner = owner;
  }
}
export function normalizePlate(plate: string): string {
  const raw = plate.trim().toUpperCase().replace(/-/g, "");
  return raw.length === 6 ? raw.slice(0, 3) + "-" + raw.slice(3) : raw;
}
export function isValidPlate(plate: string): boolean {
  return /^[A-Z0-9]{3}-?[A-Z0-9]{3}$/.test(plate.trim().toUpperCase());
}
