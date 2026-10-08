import fs from "node:fs";
const units = JSON.parse(fs.readFileSync("src/data/units.json"));
const targets = JSON.parse(
  fs.readFileSync("reports/research/regiment-shield-targets.json"),
);
const pages = Object.values(
  JSON.parse(fs.readFileSync("reports/research/regiment-shield-metadata.json"))
    .query.pages,
);
const selected = units.filter((u) =>
  ["Regimiento", "Batallón", "Tercio"].includes(u.type),
);
const rows = selected.map((u) => ({
  id: u.id,
  name: u.name,
  shield: !!u.shield,
  history: !!u.history,
  mission: !!u.mission,
  description: !!u.fullDescription,
  equipment: !!u.equipment?.length,
  location: !!u.garrisonId,
  contacts: u.contacts.length,
  sources: u.sources.length,
}));
const pending = targets
  .filter(([id]) => !units.find((u) => u.id === id)?.shield)
  .map(([id, title]) => ({
    id,
    title,
    source: pages.find((p) => p.title === "File:" + title)?.imageinfo?.[0]
      ?.descriptionurl,
    reason:
      "Descarga pendiente tras el límite HTTP 429 de Wikimedia. Metadatos y licencia localizados.",
  }));
fs.writeFileSync(
  "reports/regiment-coverage.json",
  JSON.stringify(
    {
      reviewedAt: "2026-10-08",
      units: units.length,
      shields: units.filter((u) => u.shield).length,
      targetUnits: rows.length,
      coverage: rows,
      pendingShields: pending,
    },
    null,
    2,
  ) + "\n",
);
const lines = [
  "# Cobertura de regimientos y batallones",
  "",
  "Revisión documental: 08/10/2026. Incluye los tercios y banderas registrados en el catálogo. Los campos vacíos siguen pendientes; una fuente oficial antigua no certifica la situación actual.",
  "",
  `Escudos locales: ${units.filter((u) => u.shield).length}. Escudos localizados pendientes de descarga: ${pending.length}.`,
  "",
  "| Unidad | Escudo | Historia | Misión / descripción | Material | Instalación |",
  "|---|---|---|---|---|---|",
  ...rows.map(
    (r) =>
      `| ${r.name} | ${r.shield ? "Sí" : "Pendiente"} | ${r.history ? "Sí" : "Pendiente"} | ${r.mission || r.description ? "Sí" : "Pendiente"} | ${r.equipment ? "Sí" : "Pendiente"} | ${r.location ? "Sí" : "Pendiente"} |`,
  ),
  "",
  "La imagen de Commons identifica una representación heráldica de la unidad. Algunos nombres de archivo conservan denominaciones anteriores; no se utilizan como fuente de la organización actual.",
  "",
];
fs.writeFileSync("reports/regiment-coverage.md", lines.join("\n"));
console.log({
  selected: rows.length,
  localShields: units.filter((u) => u.shield).length,
  pending: pending.length,
});
