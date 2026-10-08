import { Shield as ShieldIcon } from "lucide-react";
import { useState } from "react";
import type { Unit } from "../types";
export function Shield({
  unit,
  large = false,
}: {
  unit: Unit;
  large?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const src = large
    ? unit.shield?.localAsset || unit.shield?.imageUrl || unit.shield?.thumbnail
    : unit.shield?.thumbnail ||
      unit.shield?.localAsset ||
      unit.shield?.imageUrl;
  const failed = Boolean(src && failedSrc === src);
  return (
    <span
      className={`shield ${large ? "large" : ""}`}
      title={
        src && !failed
          ? "Escudo de la unidad"
          : "Escudo pendiente de incorporación"
      }
    >
      {src && !failed ? (
        <img
          src={src}
          alt={`Escudo de ${unit.name}`}
          onError={() => setFailedSrc(src)}
          loading="lazy"
        />
      ) : (
        <ShieldIcon
          aria-label="Sin escudo documentado"
          size={large ? 42 : 24}
        />
      )}
    </span>
  );
}
