import {
  ArrowLeftRight,
  Circle,
  Info,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { apparentDirection, number, signed } from "../format";
import type { stroboscopy } from "../physics";

export function MetricsPanel({
  physics,
  rotationPeriod,
  flashPeriod,
}: {
  physics: ReturnType<typeof stroboscopy>;
  rotationPeriod: number;
  flashPeriod: number;
}) {
  const DirectionIcon = physics.ambiguous
    ? ArrowLeftRight
    : physics.minimalStep === 0
      ? Circle
      : physics.minimalStep < 0
        ? RotateCw
        : RotateCcw;
  return (
    <section className="analysis-section" aria-labelledby="metrics-title">
      <div className="section-heading">
        <div>
          <h2 id="metrics-title">Analyse du mouvement</h2>
          <p>Les mêmes observations. Une interprétation à préciser.</p>
        </div>
        <span className="section-caption">MESURES EN TEMPS SIMULÉ</span>
      </div>
      <div className="metrics-panel surface">
        <div className="metric" title="Fréquence réelle : f = 1 / T">
          <span>
            Fréquence réelle <i>f</i>
          </span>
          <strong data-testid="real-frequency">
            {number(physics.actualFrequency)}
            <small>Hz</small>
          </strong>
          <p>Un tour toutes les {number(rotationPeriod)} s</p>
        </div>
        <div
          className="metric"
          title="Fréquence d’échantillonnage : fₑ = 1 / Tₑ"
        >
          <span>
            Fréquence des éclairs <i>fₑ</i>
          </span>
          <strong data-testid="flash-frequency">
            {number(1 / flashPeriod)}
            <small>Hz</small>
          </strong>
          <p>Un éclair toutes les {number(flashPeriod)} s</p>
        </div>
        <div
          className="metric"
          title="Nombre de tours réels entre deux éclairs"
        >
          <span>Rapport des périodes</span>
          <strong data-testid="period-ratio">
            {number(flashPeriod / rotationPeriod)}
            <small>Tₑ/T</small>
          </strong>
          <p>{number(physics.actualStep)}° parcourus réellement</p>
        </div>
        <div
          className="metric delta-metric"
          title="Plus court déplacement signé entre deux positions ; à 180°, les deux signes sont équivalents"
        >
          <span>
            Décalage apparent <i>Δθ</i>
          </span>
          <strong data-testid="minimal-step">
            {physics.ambiguous ? "±180" : signed(physics.minimalStep)}
            <small>°</small>
          </strong>
          <p>Angle minimal par éclair</p>
        </div>
        <div className="metric direction-metric">
          <span>Sens apparent</span>
          <strong className="sense-value" data-testid="apparent-direction">
            <DirectionIcon size={22} />
            {apparentDirection(physics.minimalStep, physics.ambiguous)}
          </strong>
          <p>
            f<sub>app</sub> ={" "}
            {physics.ambiguous
              ? `±${number(Math.abs(physics.apparentFrequency), 6)}`
              : signed(physics.apparentFrequency, 6)}{" "}
            Hz
          </p>
        </div>
      </div>
      <div className="interpretation">
        <Info size={17} />
        <p data-testid="explanation">
          {physics.ambiguous ? (
            "Les positions sont diamétralement opposées. +180° et −180° sont également plausibles : les éclairs ne permettent pas de choisir un sens."
          ) : physics.minimalStep === 0 ? (
            <>
              Le point réapparaît au même endroit après{" "}
              {number(flashPeriod / rotationPeriod)} tour(s) : il semble
              immobile, alors que le disque continue de tourner.
            </>
          ) : (
            <>
              Le disque avance réellement de{" "}
              <strong>{number(physics.actualStep)}°</strong> entre deux éclairs.
              Le plus court déplacement est{" "}
              <strong>{signed(physics.minimalStep)}°</strong> : le point semble{" "}
              {physics.minimalStep < 0 ? "reculer" : "avancer"}.
            </>
          )}{" "}
          <span>
            Tous les déplacements Δθ<sub>min</sub> + 360° × k, k entier,
            produisent les mêmes observations.
          </span>
        </p>
      </div>
    </section>
  );
}
