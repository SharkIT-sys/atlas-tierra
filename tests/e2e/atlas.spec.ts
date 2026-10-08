import { test, expect } from "@playwright/test";
test("escudos ampliados, recuperación de imagen y ficha documentada", async ({
  page,
}) => {
  await page.route("**/shields/asturias.png", (route) => route.abort());
  await page.goto("/#/unidad/asturias");
  await expect(
    page.locator('.shield.large [aria-label="Sin escudo documentado"]').first(),
  ).toBeVisible();
  await page.goto("/#/unidad/covadonga");
  const shield = page.locator(".shield.large img").first();
  await expect(shield).toHaveAttribute("src", "/shields/covadonga.png");
  await expect
    .poll(() => shield.evaluate((img: HTMLImageElement) => img.naturalHeight))
    .toBe(768);
  await page.goto("/#/unidad/pirineos");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Pirineos",
  );
  await expect(page.getByText(/se constituyó en 1943/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /974.*358.*011/ }),
  ).toHaveAttribute("href", "tel:+34974358011");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/unidad/tercio3");
  await expect(page.getByText("Central de la instalación")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "+34950180062", exact: true }),
  ).toHaveAttribute("href", "tel:+34950180062");
  await expect(
    page.getByText("Teléfono propio de la unidad no documentado."),
  ).toBeVisible();
});
test("estructuras como puentes y nuevas unidades sin favoritos ni glosario", async ({
  page,
}) => {
  await page.goto("/#/unidad/fuerza");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fuerza");
  await expect(
    page.getByRole("button", { name: "Guardar", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Favoritos", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Glosario", exact: true }),
  ).toHaveCount(0);
  await page.goto("/#/organigrama");
  await expect(page.locator(".graph-bridge")).toHaveCount(4);
  await page.screenshot({
    path: `reports/puentes-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.goto("/#/unidad/bri10");
  const shield = page.locator(".shield.large img").first();
  await expect(shield).toBeVisible();
  await expect
    .poll(() => shield.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0);
  await page
    .getByRole("button", { name: /Regimiento de Infantería.*Reina/ })
    .click();
  await expect(page.getByRole("button", { name: /Lepanto/ })).toBeVisible();
});
test("flujo RAC 61, ficha, organigrama, subordinadas", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Buscar unidad, base o localidad" })
    .fill("RAC 61");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await page.getByRole("button", { name: /RAC 61 · Fuerza/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Alcázar de Toledo",
  );
  await expect(
    page.getByRole("link", { name: "+34 916 599 620", exact: true }),
  ).toHaveAttribute("href", "tel:+34916599620");
  await page.reload();
  await page.getByRole("button", { name: "Ver en el organigrama" }).click();
  await expect(
    page.locator('.react-flow__node[data-id="rac61"]'),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Expandir Regimiento Acorazado «Alcázar de Toledo» nº 61",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Ajustar vista", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Batallón de Infantería de Carros de Combate «León» I/61",
      exact: true,
    })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("León");
  await page.goBack();
  await expect(page.locator(".graph")).toBeVisible();
});
test("árbol, filtros, tema, fuentes y exportación", async ({ page }) => {
  await page.goto("/#/arbol");
  await page
    .getByRole("button", { name: "Expandir Apoyo a la Fuerza", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Expandir Inspección General del Ejército de Tierra",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: /Dirección de Acuartelamiento Dirección/ })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Dirección de Acuartelamiento",
  );
  await page.goto("/#/buscar");
  await page
    .getByLabel("Especialidad", { exact: true })
    .selectOption("Caballería");
  await expect(
    page.getByRole("button", { name: /GCAC Villaviciosa/ }).first(),
  ).toBeVisible();
  await page.goto("/#/informacion");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON completo" }).click();
  expect((await download).suggestedFilename()).toBe("atlas-tierra.json");
  await expect(
    page.getByRole("heading", { name: "Bibliografía y fuentes" }),
  ).toBeVisible();
  if (
    await page
      .getByRole("button", { name: "Abrir menú", exact: true })
      .isVisible()
  )
    await page.getByRole("button", { name: "Abrir menú", exact: true }).click();
  await page.getByRole("button", { name: "Tema Oscuro", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Tema Claro", exact: true }).click();
});
test("adaptación móvil y ausencia de errores JavaScript", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.screenshot({
    path: `reports/inicio-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/unidad/rac61");
  await page.screenshot({
    path: `reports/ficha-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/#/base/el-goloso");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  expect(errors).toEqual([]);
});
test("PWA consulta fichas tras recargar sin conexión", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.goto("/#/unidad/rac61");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Alcázar de Toledo",
  );
  await page.goto("/#/organigrama/rac61");
  await expect(page.locator(".graph")).toBeVisible();
  await context.setOffline(false);
});
