import { dataset } from "../src/data/index";
import { validateData } from "../src/features/military-organization/utils/validate";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import credits from "../public/shields/credits.json";
import glossary from "../src/data/glossary.json";
import abbreviations from "../src/data/abbreviations.json";
const errors = validateData(dataset);
for (const entry of [...glossary, ...abbreviations]) {
  if (!entry.term || !entry.definition || !entry.sources.length)
    errors.push(`Entrada educativa incompleta: ${entry.term}`);
  for (const id of entry.sources)
    if (!dataset.sources.some((s) => s.id === id))
      errors.push(`Fuente educativa inexistente: ${entry.term}/${id}`);
}
for (const u of dataset.units) {
  if (!u.shield) continue;
  for (const path of [u.shield.localAsset, u.shield.thumbnail])
    if (path && !existsSync("public" + path))
      errors.push(`Imagen local inexistente: ${u.id}/${path}`);
  const matches = credits.filter((c) => c.unitId === u.id);
  const credit = matches[0];
  if (
    matches.length !== 1 ||
    credit.path !== u.shield.localAsset ||
    credit.source !== u.shield.sourceUrl ||
    credit.license !== u.shield.license ||
    credit.author !== u.shield.author
  )
    errors.push(`Crédito de imagen ausente o incoherente: ${u.id}`);
  const original = u.shield.localAsset?.endsWith(".svg")
    ? "public" + u.shield.localAsset
    : `reports/research/shield-originals/${u.id}.svg`;
  if (
    credit &&
    existsSync(original) &&
    createHash("sha1").update(readFileSync(original)).digest("hex") !==
      credit.sha1
  )
    errors.push(`Original de escudo con hash diferente: ${u.id}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Datos válidos: ${dataset.units.filter((u) => u.nodeKind === "unit").length} unidades y órganos; ${dataset.units.filter((u) => u.nodeKind !== "unit").length} puentes de estructura/organización; ${dataset.garrisons.length} instalaciones; ${dataset.sources.length} fuentes.`,
  );
