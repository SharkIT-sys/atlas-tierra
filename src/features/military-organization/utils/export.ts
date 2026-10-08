import type { Dataset, Unit } from "../types";
import { isStructural } from "../services/repository";
export function makeCsv(units: Unit[]) {
  const keys = [
    "id",
    "name",
    "abbreviation",
    "type",
    "parentId",
    "garrisonId",
    "status",
    "lastVerified",
  ] as const;
  const cell = (v: unknown) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return (
    "\uFEFF" +
    [
      keys.join(","),
      ...units
        .filter((u) => !isStructural(u))
        .map((u) => keys.map((k) => cell(u[k])).join(",")),
    ].join("\r\n")
  );
}
export function downloadData(data: Dataset, format: "json" | "csv") {
  const blob = new Blob(
    [format === "json" ? JSON.stringify(data, null, 2) : makeCsv(data.units)],
    { type: format === "json" ? "application/json" : "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `atlas-tierra.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
