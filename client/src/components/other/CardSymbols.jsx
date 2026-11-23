import { TYPES } from "./cardTypes";
import "./other.css";

const STAGE_LABELS = {
  Basic: "Basic",
  Stage1: "Stage 1",
  Stage2: "Stage 2",
  MEGA: "MEGA",
  VMAX: "VMAX",
  VSTAR: "VSTAR",
  "LEVEL-UP": "Level Up",
  RESTORED: "Restored",
};

export function TypeBadge({ type, size = "md", showLabel = true }) {
  const meta = TYPES[type];
  if (!meta) return <span className="type-badge">{type}</span>;
  return (
    <span
      className={`type-badge type-badge--${size}`}
      style={{ "--type-colour": meta.colour, "--type-index": meta.index }}
      title={type}
    >
      <span className="type-badge__disc" aria-hidden="true" />
      {showLabel && <span className="type-badge__label">{type}</span>}
    </span>
  );
}

export function StageBadge({ stage }) {
  if (!stage) return null;
  const label = STAGE_LABELS[stage] ?? stage;
  return (
    <span className="stage-badge" title={`Stage: ${label}`}>
      <span className="stage-badge__text">{label}</span>
    </span>
  );
}

export function RetreatCost({ cost }) {
  if (cost === undefined || cost === null) return null;
  const count = Number(cost);
  if (!Number.isFinite(count)) return null;
  return (
    <span className="retreat" aria-label={`Retreat cost ${count}`}>
      {count === 0 ? (
        <span className="retreat__free">Free</span>
      ) : (
        Array.from({ length: count }, (_, index) => (
          <TypeBadge key={index} type="Colorless" size="sm" showLabel={false} />
        ))
      )}
    </span>
  );
}
