import Papa from "papaparse";
import { Vehicle } from "../../vehicle-information/domain/model/vehicle.entity";
import { CsvValidation, validateImportRows } from "../domain/model/csv-import";

export function validateCsv(
  text: string,
  existing: Vehicle[],
  year: number,
): CsvValidation {
  const parsed = Papa.parse<Record<string, string>>(
    text.replace(/^\uFEFF/, ""),
    {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim().toLowerCase(),
    },
  );
  return validateImportRows(
    {
      data: parsed.data,
      fields: parsed.meta.fields ?? [],
      hasErrors: parsed.errors.length > 0,
    },
    existing,
    year,
  );
}
