import fs from "node:fs";
import crypto from "node:crypto";
const targets = JSON.parse(
  fs.readFileSync("reports/research/regiment-shield-targets.json"),
);
const pages = Object.values(
  JSON.parse(fs.readFileSync("reports/research/regiment-shield-metadata.json"))
    .query.pages,
);
const log = [];
const cooldownPath = "reports/research/shield-cooldown.json";
const notBefore = fs.existsSync(cooldownPath)
  ? JSON.parse(fs.readFileSync(cooldownPath)).notBefore
  : 0;
while (Date.now() < notBefore)
  await new Promise((r) =>
    setTimeout(r, Math.min(30000, notBefore - Date.now())),
  );
for (const [id, title] of targets) {
  const info = pages.find((p) => p.title === "File:" + title)?.imageinfo?.[0];
  if (!info) throw Error("Missing " + id);
  const path = `reports/research/shield-originals/${id}.svg`;
  if (fs.existsSync(path)) {
    console.log("Cached", id);
    continue;
  }
  const r = await fetch(info.url, {
    signal: AbortSignal.timeout(45000),
    headers: {
      "User-Agent":
        "AtlasTierra/1.0 (educational local atlas; sequential asset retrieval)",
    },
  });
  log.push({ id, status: r.status, at: new Date().toISOString() });
  fs.writeFileSync(
    "reports/research/regiment-download-log.json",
    JSON.stringify(log, null, 2),
  );
  if (!r.ok) {
    const retry = r.headers.get("retry-after");
    if (r.status === 429)
      fs.writeFileSync(
        cooldownPath,
        JSON.stringify({ notBefore: Date.now() + Number(retry || 600) * 1000 }),
      );
    console.log("Stopped", r.status, id, "Retry-After", retry);
    break;
  }
  const data = Buffer.from(await r.arrayBuffer());
  if (crypto.createHash("sha1").update(data).digest("hex") !== info.sha1)
    throw Error("Hash " + id);
  fs.writeFileSync(path, data);
  console.log("Downloaded and verified", id);
  await new Promise((r) => setTimeout(r, 12000));
}
