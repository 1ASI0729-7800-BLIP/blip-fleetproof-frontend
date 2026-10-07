import {
  Vehicle,
  isValidPlate,
  normalizePlate,
} from "../../../vehicle-information/domain/model/vehicle.entity";
export interface ImportRow {
  plate: string;
  brand: string;
  model: string;
  year: number;
  responsible: string;
}
export interface CsvValidation {
  rows: ImportRow[];
  invalidRows: number[];
  error: string | null;
}
export function validateImportRows(
  parsed: {
    data: Record<string, string>[];
    fields: string[];
    hasErrors: boolean;
  },
  existing: Vehicle[],
  year: number,
): CsvValidation {
  const required = ["plate", "brand", "model", "year", "responsible"];
  if (
    parsed.hasErrors ||
    !required.every((h) => parsed.fields.includes(h)) ||
    !parsed.data.length
  )
    return { rows: [], invalidRows: [], error: "vehicle.importInvalid" };
  const seen = new Set(existing.map((v) => normalizePlate(v.plate)));
  const rows: ImportRow[] = [];
  const invalidRows: number[] = [];
  parsed.data.forEach((raw, i) => {
    const plate = normalizePlate(raw["plate"] || "");
    const item = {
      plate,
      brand: (raw["brand"] || "").trim(),
      model: (raw["model"] || "").trim(),
      year: Number(raw["year"]),
      responsible: (raw["responsible"] || "").trim(),
    };
    if (
      !isValidPlate(plate) ||
      seen.has(plate) ||
      !item.brand ||
      !item.model ||
      !Number.isInteger(item.year) ||
      item.year < 1950 ||
      item.year > year + 1
    ) {
      invalidRows.push(i + 2);
    } else rows.push(item);
    seen.add(plate);
  });
  if (invalidRows.length)
    return { rows: [], invalidRows, error: "vehicle.importInvalid" };
  if (existing.length + rows.length > 25)
    return { rows: [], invalidRows: [], error: "vehicle.quota" };
  return { rows, invalidRows: [], error: null };
}
