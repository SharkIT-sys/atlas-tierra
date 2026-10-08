import type { Dataset } from "../types";
export function validateData(data: Dataset): string[] {
  const errors: string[] = [];
  const url = (value: string, label: string) => {
    try {
      if (!["https:", "http:"].includes(new URL(value).protocol)) throw Error();
    } catch {
      errors.push(`URL inválida: ${label}`);
    }
  };
  for (const [label, items] of [
    ["unidades", data.units],
    ["instalaciones", data.garrisons],
    ["fuentes", data.sources],
  ] as const) {
    const seen = new Set<string>();
    for (const item of items) {
      if (!item.id || seen.has(item.id))
        errors.push(`ID duplicado o vacío en ${label}: ${item.id}`);
      seen.add(item.id);
    }
  }
  const ids = new Set(data.units.map((u) => u.id)),
    gs = new Set(data.garrisons.map((g) => g.id)),
    ss = new Set(data.sources.map((s) => s.id));
  const names = new Set<string>();
  data.sources.forEach((s) => url(s.url, s.id));
  for (const item of [...data.units, ...data.garrisons]) {
    if (!item.name?.trim()) errors.push(`Sin nombre: ${item.id}`);
    if (!item.sources.length) errors.push(`Sin fuentes: ${item.id}`);
    for (const s of item.sources)
      if (!ss.has(s)) errors.push(`Fuente inexistente: ${item.id}/${s}`);
    for (const evidence of Object.values(item.fieldSources || {}))
      for (const s of evidence.sourceIds)
        if (!ss.has(s))
          errors.push(`Fuente de campo inexistente: ${item.id}/${s}`);
    if (item.website) url(item.website, item.id);
    if (item.phone && !item.fieldSources.phone?.sourceIds.length)
      errors.push(`Teléfono sin fuente: ${item.id}`);
  }
  for (const u of data.units) {
    const key = u.name.toLowerCase() + "|" + u.parentId;
    if (names.has(key)) errors.push(`Unidad duplicada: ${u.name}`);
    names.add(key);
    if (
      !["active", "historical", "disbanded", "transformed", "unknown"].includes(
        u.status,
      )
    )
      errors.push(`Estado inválido: ${u.id}`);
    if (u.parentId === u.id) errors.push(`Autorreferencia: ${u.id}`);
    if (u.parentId && !ids.has(u.parentId)) errors.push(`Huérfana: ${u.id}`);
    if (!u.parentId && u.type !== "Organización")
      errors.push(`Raíz huérfana: ${u.id}`);
    if (u.garrisonId && !gs.has(u.garrisonId))
      errors.push(`Instalación inexistente: ${u.id}`);
    for (const link of [u.previousUnitId, u.successorUnitId])
      if (link && !ids.has(link)) errors.push(`Relación inexistente: ${u.id}`);
    if (u.shield) {
      if (!u.shield.sourceUrl || !u.shield.license || !u.shield.attribution)
        errors.push(`Imagen sin fuente/licencia: ${u.id}`);
      else url(u.shield.sourceUrl, u.id);
      if (u.shield.imageUrl) url(u.shield.imageUrl, u.id);
    }
    for (const c of u.contacts)
      if (!ss.has(c.sourceId)) errors.push(`Contacto sin fuente: ${u.id}`);
    const seen = new Set<string>();
    let p: typeof u | undefined = u;
    while (p) {
      if (seen.has(p.id)) {
        errors.push(`Ciclo: ${u.id}`);
        break;
      }
      seen.add(p.id);
      p = data.units.find((x) => x.id === p?.parentId);
    }
  }
  for (const r of data.relations)
    if (
      !ids.has(r.fromId) ||
      !ids.has(r.toId) ||
      r.sources.some((s) => !ss.has(s))
    )
      errors.push("Relación inválida");
  for (const g of data.garrisons) {
    if ((g.latitude === undefined) !== (g.longitude === undefined))
      errors.push(`Coordenadas incompletas: ${g.id}`);
    if (
      g.latitude !== undefined &&
      (Math.abs(g.latitude) > 90 || Math.abs(g.longitude!) > 180)
    )
      errors.push(`Coordenadas inválidas: ${g.id}`);
  }
  return errors;
}
