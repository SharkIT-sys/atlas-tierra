import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Handle,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Repository } from "../services/repository";
import { isStructural } from "../services/repository";
import type { Unit } from "../types";
import { Shield } from "../components/Shield";
type UnitNode = Node<
  {
    unit: Unit;
    count: number;
    expanded: boolean;
    toggle: (id: string) => void;
    open: (id: string) => void;
  },
  "unit"
>;
const Card = memo(function Card({ data, selected }: NodeProps<UnitNode>) {
  if (isStructural(data.unit))
    return (
      <div className={`graph-bridge branch-${data.unit.branch}`}>
        <Handle type="target" position={Position.Top} />
        <small>
          {data.unit.nodeKind === "organization"
            ? "ORGANIZACIÓN"
            : "ESTRUCTURA"}
        </small>
        <button
          className="nodrag"
          onClick={() => data.toggle(data.unit.id)}
          aria-expanded={data.expanded}
          aria-label={`${data.expanded ? "Contraer" : "Expandir"} ${data.unit.name}`}
        >
          {data.unit.name} <span>{data.expanded ? "−" : "+"}</span>
        </button>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  return (
    <div
      className={`graph-card branch-${data.unit.branch} ${selected ? "selected" : ""}`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="graph-top">
        <Shield unit={data.unit} />
        <small>{data.unit.abbreviation || data.unit.type}</small>
      </div>
      <button
        className="graph-title nodrag"
        onClick={() => data.open(data.unit.id)}
      >
        {data.unit.name}
      </button>
      <button
        className="graph-expand nodrag"
        disabled={!data.count}
        aria-expanded={data.count ? data.expanded : undefined}
        aria-label={`${data.expanded ? "Contraer" : "Expandir"} ${data.unit.name}`}
        onClick={() => data.toggle(data.unit.id)}
      >
        {data.count
          ? `${data.expanded ? "−" : "+"} ${data.count} subordinadas`
          : "Sin subordinadas registradas"}
      </button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
const nodeTypes = { unit: Card };
function Canvas({
  repo,
  target,
  open,
}: {
  repo: Repository;
  target: string;
  open: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(
    () => new Set(["et", ...repo.getAncestors(target).map((u) => u.id)]),
  );
  const [selected, setSelected] = useState(target);
  const flow = useReactFlow();
  const toggle = useCallback(
    (id: string) =>
      setExpanded((old) => {
        const next = new Set(old);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );
  const { nodes, edges, truncated } = useMemo(() => {
    const nodes: UnitNode[] = [];
    const edges: { id: string; source: string; target: string }[] = [];
    let leaf = 0;
    let truncated = false;
    function walk(id: string, depth: number): number {
      if (nodes.length >= 180) {
        truncated = true;
        return leaf++ * 275;
      }
      const u = repo.getUnitById(id)!;
      const node: UnitNode = {
        id,
        type: "unit",
        position: { x: 0, y: depth * 210 },
        data: {
          unit: u,
          count: repo.getChildren(id).length,
          expanded: expanded.has(id),
          toggle,
          open,
        },
        selected: id === selected,
      };
      nodes.push(node);
      const children = expanded.has(id) ? repo.getChildren(id) : [];
      const xs: number[] = [];
      for (const c of children) {
        if (nodes.length >= 180) {
          truncated = true;
          break;
        }
        xs.push(walk(c.id, depth + 1));
        edges.push({ id: `${id}-${c.id}`, source: id, target: c.id });
      }
      const x = xs.length ? (xs[0] + xs[xs.length - 1]) / 2 : leaf++ * 275;
      node.position.x = x;
      return x;
    }
    walk("et", 0);
    return { nodes, edges, truncated };
  }, [repo, expanded, toggle, open, selected]);
  useEffect(() => {
    const node = nodes.find((n) => n.id === target);
    if (node) {
      const timer = setTimeout(
        () =>
          flow.setCenter(node.position.x + 120, node.position.y + 80, {
            zoom: 0.9,
            duration: 350,
          }),
        120,
      );
      return () => clearTimeout(timer);
    }
  }, [target, flow]); // positions are available on mount; expanding preserves the user's viewport
  return (
    <>
      <div className="graph-toolbar">
        <span>
          <i className="dot cg" /> Cuartel General <i className="dot fuerza" />{" "}
          Fuerza <i className="dot apoyo" /> Apoyo
        </span>
        <button onClick={() => flow.fitView({ padding: 0.2, duration: 300 })}>
          Ajustar vista
        </button>
        <button
          onClick={() => {
            setExpanded(new Set(["et"]));
            setTimeout(() => flow.fitView({ padding: 0.3 }), 60);
          }}
        >
          Plegar
        </button>
      </div>
      <div className="graph" aria-label="Mapa mental interactivo">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, n) => setSelected(n.id)}
          fitView
          minZoom={0.12}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          onlyRenderVisibleElements
          zoomOnPinch
          panOnDrag
          ariaLabelConfig={{
            "controls.zoomIn.ariaLabel": "Acercar",
            "controls.zoomOut.ariaLabel": "Alejar",
            "controls.fitView.ariaLabel": "Ajustar organigrama",
          }}
        >
          <Background gap={24} color="#c9cfca" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="graph-foot">
        <span>
          {nodes.length} nodos visibles · Arrastra para desplazarte · Pellizca
          para ampliar
        </span>
        <button onClick={() => open(selected)}>
          {isStructural(repo.getUnitById(selected))
            ? "Explorar estructura"
            : "Abrir ficha seleccionada"}
        </button>
      </div>
      {truncated && (
        <p role="status">
          Límite de 180 nodos visibles. Pliega otras ramas para seguir
          explorando.
        </p>
      )}
    </>
  );
}
export default function OrganizationGraph(props: {
  repo: Repository;
  target: string;
  open: (id: string) => void;
}) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}
