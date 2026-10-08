import fs from "node:fs";
import { chromium } from "@playwright/test";
const units = JSON.parse(fs.readFileSync("src/data/units.json")).filter(
  (u) => u.shield,
);
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1200, height: 950 } });
for (let offset = 0; offset < units.length; offset += 16) {
  await page.setContent(
    '<body style="font:16px system-ui;background:#eef1ed;display:grid;grid-template-columns:repeat(5,1fr);gap:12px">' +
      units
        .slice(offset, offset + 16)
        .map(
          (u) =>
            '<article style="background:white;padding:16px;text-align:center"><img style="height:160px;max-width:100%;object-fit:contain" src="data:image/png;base64,' +
            fs.readFileSync("public" + u.shield.thumbnail).toString("base64") +
            '"><p>' +
            u.name +
            "</p></article>",
        )
        .join(""),
  );
  await page
    .locator("img")
    .evaluateAll((imgs) => Promise.all(imgs.map((img) => img.decode())));
  await page.screenshot({
    path: `reports/escudos-pagina-${1 + offset / 16}.png`,
    fullPage: true,
  });
}
await page.goto("http://127.0.0.1:4173/#/unidad/tercio3");
await page.locator(".shield.large img").first().waitFor();
await page.screenshot({ path: "reports/tercio3-ampliado.png", fullPage: true });
await browser.close();
console.log("Escudos decodificados:", units.length);
