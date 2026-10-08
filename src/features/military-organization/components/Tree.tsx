import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { Repository } from "../services/repository";
import { isStructural } from "../services/repository";
export function Tree({
  repo,
  open,
}: {
  repo: Repository;
  open: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(new Set(["et"]));
  const [limit, setLimit] = useState(100);
  const rows: { id: string; depth: number }[] = [];
  const visit = (id: string, depth: number) => {
    rows.push({ id, depth });
    if (expanded.has(id))
      repo.getChildren(id).forEach((u) => visit(u.id, depth + 1));
  };
  repo.data.units.filter((u) => !u.parentId).forEach((u) => visit(u.id, 0));
  return (
    <>
      <div className="toolbar">
        <p>Despliega una rama y abre la ficha de cualquier unidad.</p>
        <button onClick={() => setExpanded(new Set(["et"]))}>
          Plegar ramas
        </button>
      </div>
      <div className="tree" aria-label="Explorador de unidades">
        {rows.slice(0, limit).map(({ id, depth }) => {
          const u = repo.getUnitById(id)!;
          const children = repo.getChildren(id);
          return (
            <div
              key={id}
              className={`tree-row ${isStructural(u) ? "tree-bridge" : ""}`}
              style={{ paddingLeft: `${Math.min(depth, 6) * 18 + 10}px` }}
            >
              <button
                className="icon-button"
                disabled={!children.length}
                aria-label={`${expanded.has(id) ? "Contraer" : "Expandir"} ${u.name}`}
                aria-expanded={children.length ? expanded.has(id) : undefined}
                onClick={() =>
                  setExpanded((old) => {
                    const next = new Set(old);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
              >
                {expanded.has(id) ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
              <button
                className="tree-name"
                onClick={() =>
                  isStructural(u)
                    ? setExpanded((old) => {
                        const next = new Set(old);
                        if (next.has(id)) next.delete(id);
                        else next.add(id);
                        return next;
                      })
                    : open(id)
                }
              >
                <span>{u.name}</span>
                <small>
                  {isStructural(u)
                    ? "Estructura · puente de navegación"
                    : u.type}
                  {children.length
                    ? ` · ${children.length} subordinadas registradas`
                    : ""}
                </small>
              </button>
            </div>
          );
        })}
      </div>
      {rows.length > limit && (
        <button onClick={() => setLimit(limit + 100)}>
          Mostrar otras 100 unidades
        </button>
      )}
    </>
  );
}
