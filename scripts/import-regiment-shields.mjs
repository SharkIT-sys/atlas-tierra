// Imports only the explicitly reviewed target list; no asset discovery or retries.
import fs from "node:fs";
import crypto from "node:crypto";
import { chromium } from "@playwright/test";
const targets = JSON.parse(
  fs.readFileSync("reports/research/regiment-shield-targets.json"),
);
const pages = Object.values(
  JSON.parse(fs.readFileSync("reports/research/regiment-shield-metadata.json"))
    .query.pages,
);
fs.mkdirSync("reports/research/shield-originals", { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
await page.route("**/*", (route) => route.abort());
const credits = JSON.parse(fs.readFileSync("public/shields/credits.json"));
const units = JSON.parse(fs.readFileSync("src/data/units.json"));
for (const [id, title] of targets) {
  if (!fs.existsSync(`reports/research/shield-originals/${id}.svg`)) {
    console.log("Skipped unavailable cached original", id);
    continue;
  }
  const info = pages.find((p) => p.title === "File:" + title)?.imageinfo?.[0];
  if (!info) throw Error("Missing metadata: " + id);
  const meta = info.extmetadata;
  const license = meta.LicenseShortName.value;
  if (!["CC BY-SA 3.0", "CC BY-SA 4.0"].includes(license))
    throw Error("Unreviewed license: " + id);
  const originalPath = `reports/research/shield-originals/${id}.svg`;
  let svg;
  if (fs.existsSync(originalPath)) svg = fs.readFileSync(originalPath);
  else {
    const r = await fetch(info.url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw Error(`${r.status} ${id}; stopped without retry`);
    svg = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(originalPath, svg);
    await new Promise((r) => setTimeout(r, 2000));
  }
  const sha1 = crypto.createHash("sha1").update(svg).digest("hex");
  if (sha1 !== info.sha1) throw Error("Hash mismatch: " + id);
  if (/<script|<foreignObject|\son\w+\s*=/i.test(svg.toString()))
    throw Error("Active content: " + id);
  const images = await page.evaluate(async (data) => {
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + data;
    await img.decode();
    return [768, 256].map((height) => {
      const c = document.createElement("canvas");
      c.height = height;
      c.width = Math.round((height * img.naturalWidth) / img.naturalHeight);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL("image/png").split(",")[1];
    });
  }, svg.toString("base64"));
  const localAsset = `/shields/${id}.png`,
    thumbnail = `/shields/${id}-thumb.png`;
  fs.writeFileSync("public" + localAsset, Buffer.from(images[0], "base64"));
  fs.writeFileSync("public" + thumbnail, Buffer.from(images[1], "base64"));
  let author = meta.Artist.value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (id === "bri11") author = "Heralder; elementos de Echando una mano";
  if (id === "bri7") author = "Heralder";
  if (id === "cataluna") author = "Heralder";
  if (id === "fuerteventura")
    author = "Heralder; elementos de HansenBCN (Escudo de Fuerteventura.svg)";
  if (id === "cerinola")
    author =
      "Heralder; elementos de Sodacan (Swan Badge of Henry IV & V.svg) y Ludovicus Ferdinandus (Escudo de la Tercera República Federal de los Estados Unidos Mexicanos en 1934.svg)";
  const attribution = `${units.find((u) => u.id === id).name}. ${author}. Wikimedia Commons. ${license}. Conversión a PNG; sin cambios de diseño.`;
  const asset = {
    id: "shield-" + id,
    type: "shield",
    localAsset,
    thumbnail,
    sourceUrl: info.descriptionurl,
    author,
    license,
    licenseUrl: meta.LicenseUrl.value,
    attribution,
  };
  units.find((u) => u.id === id).shield = asset;
  const credit = {
    unitId: id,
    path: localAsset,
    source: info.descriptionurl,
    originalUrl: info.url,
    author,
    license,
    licenseUrl: meta.LicenseUrl.value,
    attribution,
    sha1,
    verifiedAt: "2026-10-08",
    thumbnail,
    changes:
      "Rasterización de SVG a PNG de 768 y 256 píxeles de alto, sin cambios de diseño.",
    originalArtistMetadata: meta.Artist.value,
    representationNote:
      "Representación heráldica publicada en Wikimedia Commons; la denominación del archivo puede corresponder a una organización anterior de la unidad.",
  };
  const old = credits.findIndex((c) => c.unitId === id);
  if (old < 0) credits.push(credit);
  else credits[old] = credit;
  console.log("Verified and imported", id, license);
}
await browser.close();
fs.writeFileSync("src/data/units.json", JSON.stringify(units, null, 2) + "\n");
fs.writeFileSync(
  "public/shields/credits.json",
  JSON.stringify(credits, null, 2) + "\n",
);
