import {
  ArrowLeftRight,
  Check,
  Circle,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";

export const experiments = [
  {
    id: "inverse",
    label: "Rotation inverse",
    t: 0.05,
    te: 0.095,
    detail: "−36° par éclair",
    Icon: RotateCw,
  },
  {
    id: "direct",
    label: "Sens direct",
    t: 0.05,
    te: 0.055,
    detail: "+36° par éclair",
    Icon: RotateCcw,
  },
  {
    id: "stationary",
    label: "Immobilité",
    t: 0.05,
    te: 0.1,
    detail: "0° par éclair",
    Icon: Circle,
  },
  {
    id: "ambiguous",
    label: "Cas ambigu",
    t: 0.05,
    te: 0.075,
    detail: "±180° · sens indéterminé",
    Icon: ArrowLeftRight,
  },
];

export function ExperimentPresets({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section
      className="experiments-section"
      aria-labelledby="experiments-title"
    >
      <div className="section-heading">
        <div>
          <h2 id="experiments-title">Expériences rapides</h2>
          <p>Un réglage. Une nouvelle perspective.</p>
        </div>
        <span className="section-caption">À EXPLORER</span>
      </div>
      <div className="experiment-grid">
        {experiments.map(({ id, label, detail, Icon }) => (
          <button
            className={`experiment ${active === id ? "selected" : ""}`}
            key={id}
            aria-pressed={active === id}
            onClick={() => onSelect(id)}
          >
            <span className="experiment-icon">
              <Icon size={21} />
            </span>
            <span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
            <Check size={15} className="experiment-check" />
          </button>
        ))}
        <button
          className={`experiment ${active === "free" ? "selected" : ""}`}
          aria-pressed={active === "free"}
          onClick={() => onSelect("free")}
        >
          <span className="experiment-icon">
            <SlidersHorizontal size={21} />
          </span>
          <span>
            <strong>Configuration libre</strong>
            <small>À vous d’expérimenter</small>
          </span>
          <Check size={15} className="experiment-check" />
        </button>
      </div>
    </section>
  );
}
