import {
  Pause,
  Play,
  RotateCcw,
  StepForward,
  Gauge,
  Settings2,
  Zap,
} from "lucide-react";
import { PeriodControl } from "./PeriodControl";
import { number } from "../format";
import type { useSimulation } from "../useSimulation";

export function PlaybackControls({
  simulation: sim,
  onPeriod,
}: {
  simulation: ReturnType<typeof useSimulation>;
  onPeriod: (which: "rotation" | "flash", value: number) => void;
}) {
  const index = Math.floor(sim.time / sim.flashPeriod + 1e-10);
  const progress = Math.max(
    0,
    Math.min(1, (sim.time - index * sim.flashPeriod) / sim.flashPeriod),
  );
  return (
    <section
      className="control-dock glass"
      aria-label="Commandes de la simulation"
    >
      <div className="dock-heading">
        <span>
          <Settings2 size={16} /> Réglages de l’expérience
        </span>
        <span>Indépendants. Précis. En secondes.</span>
      </div>
      <div className="parameters-grid">
        <PeriodControl
          label="Période de rotation"
          symbol="T"
          value={sim.rotationPeriod}
          onChange={(value) => onPeriod("rotation", value)}
        />
        <PeriodControl
          label="Période des éclairs"
          symbol="Te"
          value={sim.flashPeriod}
          onChange={(value) => onPeriod("flash", value)}
        />
        <div className="speed-control">
          <label htmlFor="speed">
            <Gauge size={16} /> Vitesse de simulation
          </label>
          <select
            id="speed"
            value={sim.speed}
            onChange={(event) => sim.setSpeed(Number(event.target.value))}
          >
            <option value="0.1">× 0,1 · Très lent</option>
            <option value="0.25">× 0,25 · Ralenti</option>
            <option value="0.5">× 0,5 · Demi-vitesse</option>
            <option value="1">× 1 · Temps réel</option>
            <option value="2">× 2 · Accéléré</option>
          </select>
          <p>Le temps change. Les lois physiques restent.</p>
        </div>
      </div>
      <div className="playback-row">
        <div className="playback-buttons">
          <button
            className="primary-button"
            onClick={() => sim.setRunning((value) => !value)}
          >
            {sim.running ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
            {sim.running ? "Pause" : sim.time > 0 ? "Reprendre" : "Démarrer"}
          </button>
          <button
            className="icon-button reset-button"
            onClick={sim.reset}
            aria-label="Réinitialiser"
            title="Remettre le temps à zéro"
          >
            <RotateCcw size={19} />
          </button>
          <span className="button-divider" />
          <button className="step-button" onClick={sim.step}>
            <StepForward size={18} />
            Éclair suivant
          </button>
        </div>
        <div className="playback-readouts">
          <div>
            <span>Temps simulé</span>
            <strong data-testid="elapsed">
              {number(sim.time)} <small>s</small>
            </strong>
          </div>
          <span className="readout-divider" />
          <div>
            <span>Observations</span>
            <strong data-testid="flash-count">{index + 1}</strong>
          </div>
        </div>
      </div>
      <div className="dock-bottom">
        <span className={`status ${sim.running ? "running" : ""}`}>
          <span />
          {sim.running
            ? `En cours · × ${number(sim.speed)}`
            : sim.time === 0
              ? "Prêt à explorer"
              : "En pause"}
        </span>
        <span className="next-flash">
          <Zap size={12} />
          Prochain éclair dans{" "}
          {number(Math.max(0, sim.flashPeriod * (1 - progress)))} s
          <span className="flash-progress">
            <span style={{ width: `${100 * progress}%` }} />
          </span>
        </span>
        <span className="reset-note">
          Modifier une période remet le temps à zéro.
        </span>
      </div>
    </section>
  );
}
