import { dataset } from "../src/data/index";
import { writeFile, mkdir } from "node:fs/promises";
import { robotsPolicy } from "./robots";
// Requests are sequential, never authenticated, never retried against a block.
const urls = [
  ...new Set(
    [
      ...dataset.sources.map((s) => s.url),
      ...dataset.units.flatMap((u) => [
        u.website,
        u.shield?.imageUrl,
        u.shield?.sourceUrl,
      ]),
      ...dataset.garrisons.map((g) => g.website),
    ].filter((s): s is string => !!s),
  ),
];
const robots = new Map<string, string | null>();
const report: { url: string; status: number | string; checkedAt: string }[] =
  [];
const limit = Number(process.env.LINK_LIMIT || urls.length);
for (const url of urls.slice(0, limit)) {
  const parsed = new URL(url);
  let status: number | string = "sin comprobar";
  try {
    if (!robots.has(parsed.origin)) {
      const r = await fetch(parsed.origin + "/robots.txt", {
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "AtlasTierraLinkCheck/1.0" },
      });
      robots.set(
        parsed.origin,
        r.ok ? await r.text() : r.status === 404 ? "" : null,
      );
      await new Promise((r) => setTimeout(r, 1200));
    }
    const rules = robots.get(parsed.origin);
    if (rules === null) {
      status = "omitido: robots no disponible";
    } else if (
      !robotsPolicy(rules || "", parsed.pathname + parsed.search).allowed
    ) {
      status = "omitido: robots.txt";
    } else if (robotsPolicy(rules || "", parsed.pathname).delay > 60000) {
      status = "omitido: crawl-delay superior a 60 segundos";
    } else {
      await new Promise((r) =>
        setTimeout(r, robotsPolicy(rules || "", parsed.pathname).delay),
      );
      const r = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "AtlasTierraLinkCheck/1.0" },
      });
      status = r.status;
    }
  } catch (e) {
    status = e instanceof Error ? e.message : "error de red";
  }
  console.log(status, url);
  report.push({ url, status, checkedAt: new Date().toISOString() });
  await new Promise((r) => setTimeout(r, 1200));
}
await mkdir("reports", { recursive: true });
await writeFile("reports/links.json", JSON.stringify(report, null, 2));
if (
  report.some((r) =>
    typeof r.status === "number"
      ? r.status >= 400
      : !r.status.startsWith("omitido:"),
  )
)
  process.exitCode = 1;
