import { describe, it, expect } from "vitest";
import { dataset } from "../src/data";
import { createRepository } from "../src/features/military-organization/services/repository";
import { createPreferences } from "../src/features/military-organization/services/storage";
import { validateData } from "../src/features/military-organization/utils/validate";
import { makeCsv } from "../src/features/military-organization/utils/export";
const repo = createRepository(dataset);
describe("Navegación jerárquica", () => {
  it("resuelve el padre orgánico", () =>
    expect(repo.getParent("rac61")?.id).toBe("bri12"));
  it("encuentra batallón y grupo", () =>
    expect(repo.getChildren("rac61").map((u) => u.id)).toEqual([
      "leon",
      "villaviciosa",
    ]));
  it("recorre antecesores ordenados", () =>
    expect(repo.getAncestors("rac61").map((u) => u.id)).toEqual([
      "et",
      "fuerza",
      "futer",
      "castillejos",
      "bri12",
    ]));
  it("recorre descendientes sin repetir", () =>
    expect(repo.getDescendants("rac61").map((u) => u.id)).toEqual([
      "leon",
      "villaviciosa",
    ]));
  it("incluye la propia unidad en la ruta", () =>
    expect(repo.getUnitPath("leon").at(-1)?.id).toBe("leon"));
  it("resuelve hermanos", () =>
    expect(repo.getSiblings("leon").map((u) => u.id)).toEqual([
      "villaviciosa",
    ]));
  it("tolera IDs desconocidos y raíz", () => {
    expect(repo.getUnitPath("missing")).toEqual([]);
    expect(repo.getParent("et")).toBeUndefined();
    expect(repo.getAncestors("et")).toEqual([]);
  });
  it("termina incluso con ciclos", () => {
    const d = structuredClone(dataset);
    d.units.find((u) => u.id === "futer")!.parentId = "rac61";
    const r = createRepository(d);
    expect(r.getAncestors("rac61").length).toBeLessThan(10);
    expect(r.getDescendants("futer").length).toBeLessThan(dataset.units.length);
  });
});
describe("Búsqueda y filtros", () => {
  it("excluye los puentes del catálogo sin romper los recorridos", () => {
    expect(
      repo
        .searchUnits("")
        .some((u) => ["et", "cg", "fuerza", "apoyo"].includes(u.id)),
    ).toBe(false);
    expect(repo.getUnitPath("rac61").map((u) => u.id)).toContain("fuerza");
    expect(makeCsv(dataset.units)).not.toContain('"fuerza","Fuerza"');
  });
  it("incluye la composición documentada de las brigadas", () => {
    for (const id of [
      "bri1",
      "bri2",
      "bri6",
      "bri7",
      "bri10",
      "bri11",
      "bri16",
      "brilog",
    ])
      expect(repo.getChildren(id).length).toBeGreaterThanOrEqual(7);
    expect(repo.getParent("roger-flor")?.id).toBe("napoles");
    expect(repo.getParent("santiago")?.id).toBe("farnesio12");
    expect(repo.getParent("espana11")?.id).toBe("castillejos");
  });
  it.each(["RAC 61", "alcazar toledo", "ALCÁZAR DE TOLEDO", "alcazr toledo"])(
    "encuentra RAC 61 con %s",
    (query) =>
      expect(repo.searchUnits(query).some((u) => u.id === "rac61")).toBe(true),
  );
  it("busca por instalación y municipio", () => {
    expect(repo.searchUnits("Goloso").some((u) => u.id === "rac61")).toBe(true);
    expect(
      repo.getUnitsByProvince("Madrid").some((u) => u.id === "rac61"),
    ).toBe(true);
  });
  it("combina filtros", () => {
    const r = repo.filterUnits(dataset.units, {
      branch: "fuerza",
      type: "Regimiento",
      specialty: "Acorazado",
    });
    expect(r.map((u) => u.id)).toContain("rac61");
    expect(r.every((u) => u.type === "Regimiento")).toBe(true);
  });
  it("no inventa resultados", () =>
    expect(repo.searchUnits("zzzzqqqqvvvv")).toEqual([]));
  it("conserva el orden y contenido de las unidades por instalación", () => {
    for (const garrison of dataset.garrisons) {
      expect(repo.getUnitsByGarrison(garrison.id)).toEqual(
        dataset.units.filter((unit) => unit.garrisonId === garrison.id),
      );
    }
    expect(repo.getUnitsByGarrison("missing")).toEqual([]);
  });
  it("resuelve fuentes y tolera referencias desconocidas", () => {
    for (const source of dataset.sources)
      expect(repo.getSourceById(source.id)).toEqual(source);
    expect(repo.getSourceById("missing")).toBeUndefined();
  });
});
describe("Integridad documental", () => {
  it("valida datos reales", () => expect(validateData(dataset)).toEqual([]));
  it("rechaza IDs duplicados", () => {
    const d = structuredClone(dataset);
    d.units.push(d.units[0]);
    expect(validateData(d).join()).toContain("ID duplicado");
  });
  it("detecta ciclos", () => {
    const d = structuredClone(dataset);
    d.units[0].parentId = "rac61";
    expect(validateData(d).join()).toContain("Ciclo");
  });
  it("detecta huérfanas", () => {
    const d = structuredClone(dataset);
    d.units[5].parentId = "ausente";
    expect(validateData(d).join()).toContain("Huérfana");
  });
  it("rechaza teléfonos sin fuente", () => {
    const d = structuredClone(dataset);
    d.units[0].phone = "123";
    expect(validateData(d).join()).toContain("Teléfono sin fuente");
  });
  it("rechaza imágenes sin licencia y fuentes inexistentes", () => {
    const d = structuredClone(dataset);
    d.units[0].sources = ["missing"];
    d.units[0].shield = {
      id: "x",
      type: "shield",
      sourceUrl: "",
      license: "",
      attribution: "",
    };
    expect(validateData(d).join()).toContain("Imagen sin fuente");
    expect(validateData(d).join()).toContain("Fuente inexistente");
  });
  it("detecta URL peligrosa", () => {
    const d = structuredClone(dataset);
    d.units[0].website = "javascript:alert(1)";
    expect(validateData(d).join()).toContain("URL inválida");
  });
});
describe("Preferencias locales", () => {
  it("limita y reordena recientes", () => {
    const db = new Map<string, string>();
    const p = createPreferences({
      getItem: (k) => db.get(k) || null,
      setItem: (k, v) => {
        db.set(k, v);
      },
    });
    for (let i = 0; i < 15; i++) p.visit(String(i));
    p.visit("10");
    expect(p.read("recent")).toHaveLength(12);
    expect(p.read("recent")[0]).toBe("10");
  });
  it("maneja almacenamiento bloqueado y JSON corrupto", () => {
    const p = createPreferences({
      getItem: () => "{bad",
      setItem: () => {
        throw Error();
      },
    });
    expect(p.read("recent")).toEqual([]);
    expect(p.visit("rac61")).toBe(false);
  });
  it("protege exportación CSV de fórmulas", () => {
    const u = {
      ...dataset.units.find((u) => u.nodeKind === "unit")!,
      name: "=SUM(1,2)",
    };
    expect(makeCsv([u])).toContain("'=SUM(1,2)");
  });
});
