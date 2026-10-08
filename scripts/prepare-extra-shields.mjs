import fs from "node:fs";
const images = JSON.parse(
  fs.readFileSync("reports/research/commons-gallery.json"),
).parse.images;
const ends = {
  merida: "1st-16_Tank_Infantry_Battalion_Mérida.svg",
  "roger-lauria": "2nd-4_Protected_Infantry_Flag_Roger_de_Lauria.svg",
  "ortiz-zarate": "3rd-5_Protected_Infantry_Flag_Ortiz_de_Zárate.svg",
  albuera: "1st-49_Motorized_Infantry_Unit_Albuera.svg",
  badajoz: "1st-62_Mechanized_Infantry_Battalion_Badajoz.svg",
  guipuzcoa: "1st-45_Motorized_Infantry_Battalion_Guipúzcoa.svg",
  montejurra: "1st-66_Motorized_Infantry_Battalion_Montejurra.svg",
  pirineos: "1st-64_Mountain_Hunters_Battalion_Pirineos.svg",
};
const targets = Object.entries(ends).map(([id, end]) => {
  const a = images.filter((s) => s.startsWith("Coat_of_") && s.endsWith(end));
  if (a.length !== 1) throw Error(id + " " + a);
  return [id, a[0].replaceAll("_", " ")];
});
const url = new URL("https://commons.wikimedia.org/w/api.php");
url.search = new URLSearchParams({
  action: "query",
  format: "json",
  prop: "imageinfo",
  iiprop: "url|sha1|extmetadata",
  titles: targets.map((t) => "File:" + t[1]).join("|"),
});
const r = await fetch(url);
if (!r.ok) throw Error(r.status);
const d = await r.json();
const existing = JSON.parse(
  fs.readFileSync("reports/research/regiment-shield-targets.json"),
);
for (const t of targets)
  if (!existing.some((x) => x[0] === t[0])) existing.push(t);
const metadata = JSON.parse(
  fs.readFileSync("reports/research/regiment-shield-metadata.json"),
);
Object.assign(metadata.query.pages, d.query.pages);
fs.writeFileSync(
  "reports/research/regiment-shield-targets.json",
  JSON.stringify(existing, null, 2),
);
fs.writeFileSync(
  "reports/research/regiment-shield-metadata.json",
  JSON.stringify(metadata, null, 2),
);
for (const p of Object.values(d.query.pages))
  console.log(
    p.title,
    p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value,
    p.imageinfo?.[0]?.extmetadata?.Artist?.value,
  );
