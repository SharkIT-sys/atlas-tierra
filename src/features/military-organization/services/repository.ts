import Fuse from "fuse.js";
import type { Dataset, Filters, Unit } from "../types";
export const isStructural = (u?: Unit) =>
  !!u && (u.nodeKind === "structure" || u.nodeKind === "organization");
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function createRepository(data: Dataset) {
  const catalogUnits = data.units.filter((u) => !isStructural(u));
  const byId = new Map(data.units.map((u) => [u.id, u]));
  const garrisons = new Map(data.garrisons.map((g) => [g.id, g]));
  const sources = new Map(data.sources.map((s) => [s.id, s]));
  const unitsByGarrison = new Map<string, Unit[]>();
  const children = new Map<string, Unit[]>();
  data.units.forEach((u) => {
    if (u.parentId) {
      const siblings = children.get(u.parentId);
      if (siblings) siblings.push(u);
      else children.set(u.parentId, [u]);
    }
    if (u.garrisonId) {
      const located = unitsByGarrison.get(u.garrisonId);
      if (located) located.push(u);
      else unitsByGarrison.set(u.garrisonId, [u]);
    }
  });
  const getUnitById = (id: string) => byId.get(id);
  const getGarrisonById = (id: string) => garrisons.get(id);
  const getParent = (id: string) => byId.get(byId.get(id)?.parentId || "");
  const getChildren = (id: string) => children.get(id) || [];
  const getAncestors = (id: string) => {
    const result: Unit[] = [];
    const seen = new Set([id]);
    let p = getParent(id);
    while (p && !seen.has(p.id)) {
      result.unshift(p);
      seen.add(p.id);
      p = getParent(p.id);
    }
    return result;
  };
  const getDescendants = (id: string) => {
    const result: Unit[] = [];
    const stack = [...getChildren(id)].reverse();
    const seen = new Set([id]);
    while (stack.length) {
      const u = stack.pop()!;
      if (seen.has(u.id)) continue;
      seen.add(u.id);
      result.push(u);
      stack.push(...getChildren(u.id).slice().reverse());
    }
    return result;
  };
  const getUnitPath = (id: string) => {
    const u = byId.get(id);
    return u ? [...getAncestors(id), u] : [];
  };
  const getSiblings = (id: string) => {
    const u = byId.get(id);
    return u?.parentId
      ? getChildren(u.parentId).filter((s) => s.id !== id)
      : [];
  };
  const indexed = catalogUnits.map((u) => ({
    unit: u,
    text: normalize(
      [
        u.name,
        u.officialName,
        u.shortName,
        u.abbreviation,
        u.type,
        u.specialty,
        u.mission,
        ...Object.values(garrisons.get(u.garrisonId || "") || {}),
      ].join(" "),
    ),
  }));
  const fuse = new Fuse(indexed, {
    keys: ["text"],
    threshold: 0.3,
    ignoreLocation: true,
  });
  const searchUnits = (query: string) => {
    const q = normalize(query.trim());
    if (!q) return catalogUnits;
    const tokens = q.split(/\s+/);
    const exact = indexed
      .filter((x) => tokens.every((t) => x.text.includes(t)))
      .map((x) => x.unit);
    const ids = new Set(exact.map((u) => u.id));
    const matches = tokens.map(
      (token) => new Set(fuse.search(token).map((r) => r.item.unit.id)),
    );
    const fuzzy = indexed
      .filter(
        (x) =>
          !ids.has(x.unit.id) && matches.every((set) => set.has(x.unit.id)),
      )
      .map((x) => x.unit);
    return [...exact, ...fuzzy];
  };
  const filterUnits = (units: Unit[], f: Filters) => {
    const entries = Object.entries(f).filter(([, value]) => Boolean(value));
    return units.filter((u) =>
      entries.every(
        ([k, v]) =>
          !v ||
          (k === "province" ||
          k === "municipality" ||
          k === "autonomousCommunity"
            ? garrisons.get(u.garrisonId || "")?.[k] === v
            : u[k as keyof Unit] === v),
      ),
    );
  };
  return {
    data,
    catalogUnits,
    getUnitById,
    getGarrisonById,
    getSourceById: (id: string) => sources.get(id),
    getParent,
    getChildren,
    getAncestors,
    getDescendants,
    getUnitPath,
    getSiblings,
    searchUnits,
    filterUnits,
    getUnitsByGarrison: (id: string) => unitsByGarrison.get(id) || [],
    getUnitsByProvince: (province: string) =>
      filterUnits(data.units, { province }),
    getUnitsBySpecialty: (specialty: string) =>
      filterUnits(data.units, { specialty }),
    getUnitsByType: (type: string) => filterUnits(data.units, { type }),
  };
}
export type Repository = ReturnType<typeof createRepository>;
