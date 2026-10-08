// Continue this explicit target list, always honoring the server's Retry-After.
// Stop on any other error or on two full cooldowns without progress.
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const targets = JSON.parse(
  fs.readFileSync("reports/research/regiment-shield-targets.json"),
);
const count = () =>
  targets.filter(([id]) =>
    fs.existsSync(`reports/research/shield-originals/${id}.svg`),
  ).length;
let stalled = 0;
while (count() < targets.length) {
  const before = count();
  const result = spawnSync(
    process.execPath,
    ["scripts/download-regiment-shields.mjs"],
    { stdio: "inherit", windowsHide: true },
  );
  if (result.status !== 0) process.exit(result.status || 1);
  const after = count();
  console.log("Cached", after, "of", targets.length);
  if (after === targets.length) break;
  const log = JSON.parse(
    fs.readFileSync("reports/research/regiment-download-log.json"),
  );
  if (log.at(-1)?.status !== 429)
    throw Error("Stopped without an authorized retry condition");
  stalled = after > before ? 0 : stalled + 1;
  if (stalled >= 2)
    throw Error(
      "Server remains unavailable after two cooldowns without progress",
    );
}
