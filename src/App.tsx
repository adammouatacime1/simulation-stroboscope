import { useEffect, useRef, useState } from "react";
import {
  flashIndexAt,
  flashSamples,
  MAX_PERIOD,
  MIN_PERIOD,
  phaseAt,
  stroboscopy,
  validPeriod,
} from "./physics";

const number = (value: number, digits = 3) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: digits });
const signed = (value: number, digits = 3) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${number(Math.abs(value), digits)}`;
type IconName = "play" | "pause" | "reset" | "step" | "bolt" | "arrow";
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    play: "M8 5l11 7-11 7V5Z",
    pause: "M8 5v14M16 5v14",
    reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
    step: "M5 5l10 7-10 7V5ZM19 5v14",
    bolt: "M13 2 4 14h7l-1 8 10-13h-8l1-7Z",
    arrow: "M5 12h14m-5-5 5 5-5 5",
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function PeriodControl({
  label,
  symbol,
  value,
  onChange,
  description,
}: {
  label: string;
  symbol: string;
  value: number;
  onChange: (value: number) => void;
  description: string;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const invalid = draft === "" || !validPeriod(Number(draft));
  return (
    <div className="period-control">
      <label htmlFor={`period-${symbol}`}>
        <span>{label}</span>
        <span className={`symbol ${symbol === "T" ? "mint" : "coral"}`}>
          {symbol === "T" ? (
            "T"
          ) : (
            <>
              T<sub>e</sub>
            </>
          )}
        </span>
      </label>
      <div className={`number-field ${invalid ? "invalid" : ""}`}>
        <input
          id={`period-${symbol}`}
          type="number"
          min={MIN_PERIOD}
          max={MAX_PERIOD}
          step="0.001"
          value={draft}
          aria-invalid={invalid}
          aria-describedby={`help-${symbol}`}
          onChange={(event) => {
            setDraft(event.target.value);
            const next = Number(event.target.value);
            if (validPeriod(next)) onChange(next);
          }}
          onBlur={() => {
            if (invalid) setDraft(String(value));
          }}
        />
        <span>secondes</span>
      </div>
      <input
        className={
          symbol === "T" ? "slider mint-slider" : "slider coral-slider"
        }
        type="range"
        aria-label={`Régler ${label.toLowerCase()}`}
        min={MIN_PERIOD}
        max={MAX_PERIOD}
        step="0.001"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="range-limits">
        <span>{number(MIN_PERIOD)} s</span>
        <span>10 s</span>
      </div>
      <p
        id={`help-${symbol}`}
        className={invalid ? "input-error" : "field-help"}
      >
        {invalid ? "Saisissez une période entre 0,001 et 10 s." : description}
      </p>
    </div>
  );
}

function point(angle: number, radius = 108) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 150 + radius * Math.cos(radians),
    y: 150 - radius * Math.sin(radians),
  };
}

function Disk({
  angle,
  apparent = false,
  samples,
  delta,
  traces,
}: {
  angle: number;
  apparent?: boolean;
  samples: ReturnType<typeof flashSamples>;
  delta: number;
  traces: boolean;
}) {
  const current = point(angle);
  const previous = samples.length > 1 ? samples[samples.length - 2] : undefined;
  const arcStart = previous ? point(previous.angle, 86) : undefined;
  const arcEnd = previous ? point(previous.angle + delta, 86) : undefined;
  return (
    <svg
      className="disk"
      viewBox="0 0 300 300"
      role="img"
      aria-label={`${apparent ? "Position au dernier éclair" : "Position réelle"} : ${number(angle)} degrés`}
    >
      <defs>
        <radialGradient id={apparent ? "disc-apparent" : "disc-real"}>
          <stop stopColor={apparent ? "#242333" : "#1c3038"} />
          <stop offset="1" stopColor="#111b2a" />
        </radialGradient>
        <filter
          id={apparent ? "glow-apparent" : "glow-real"}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <marker
          id="arc-arrow"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0 0 6 3 0 6" fill="#ff9298" />
        </marker>
      </defs>
      <circle
        cx="150"
        cy="150"
        r="128"
        fill="none"
        stroke="#253246"
        strokeDasharray="2 5"
      />
      {Array.from({ length: 60 }, (_, index) => {
        const a = point(index * 6, index % 5 === 0 ? 118 : 122);
        const b = point(index * 6, 126);
        return (
          <line
            key={index}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={index % 5 === 0 ? "#627089" : "#303e52"}
          />
        );
      })}
      <circle
        cx="150"
        cy="150"
        r="110"
        fill={`url(#${apparent ? "disc-apparent" : "disc-real"})`}
        stroke="#3a495f"
      />
      <circle
        cx="150"
        cy="150"
        r="77"
        fill="none"
        stroke="#303b4f"
        strokeDasharray="3 5"
      />
      <line
        x1="35"
        y1="150"
        x2="265"
        y2="150"
        stroke="#303b4f"
        strokeDasharray="3 5"
      />
      <line
        x1="150"
        y1="35"
        x2="150"
        y2="265"
        stroke="#303b4f"
        strokeDasharray="3 5"
      />
      {!apparent && (
        <g transform={`rotate(${-angle} 150 150)`}>
          <path d="M150 150H258" stroke="#8be2d0" strokeOpacity="0.4" />
          <path d="M150 150H42" stroke="#8be2d0" strokeOpacity="0.12" />
        </g>
      )}
      {apparent &&
        traces &&
        samples.slice(0, -1).map((sample, index) => {
          const p = point(sample.angle);
          return (
            <g
              key={sample.index}
              opacity={0.2 + (index / samples.length) * 0.5}
            >
              <circle cx={p.x} cy={p.y} r="5" fill="#ff727e" />
              <text
                x={point(sample.angle, 94).x}
                y={point(sample.angle, 94).y + 3}
                textAnchor="middle"
                fill="#ffb2b6"
                fontSize="9"
              >
                {sample.index}
              </text>
            </g>
          );
        })}
      {apparent &&
        traces &&
        previous &&
        Math.abs(delta) > 1e-8 &&
        arcStart &&
        arcEnd && (
          <>
            <path
              data-testid="apparent-arc"
              d={`M${arcStart.x},${arcStart.y} A86,86 0 0 ${delta > 0 ? 0 : 1} ${arcEnd.x},${arcEnd.y}`}
              stroke="#ff9298"
              strokeWidth="1.5"
              fill="none"
              markerEnd="url(#arc-arrow)"
            />
            {Math.abs(Math.abs(delta) - 180) < 1e-9 && (
              <path
                d={`M${arcStart.x},${arcStart.y} A86,86 0 0 1 ${arcEnd.x},${arcEnd.y}`}
                stroke="#ff9298"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arc-arrow)"
              />
            )}
          </>
        )}
      <circle cx="150" cy="150" r="6" fill="#111b2a" stroke="#728097" />
      <circle cx="150" cy="150" r="2" fill="#b3bed0" />
      <circle
        cx={current.x}
        cy={current.y}
        r="12"
        fill="#ff6675"
        opacity="0.55"
        filter={`url(#${apparent ? "glow-apparent" : "glow-real"})`}
      />
      <circle
        cx={current.x}
        cy={current.y}
        r="6"
        fill="#ff727e"
        stroke="#ffd4d7"
        strokeWidth="1.5"
      />
      <text x="288" y="154" textAnchor="middle" className="degree-label">
        0°
      </text>
      <text x="150" y="12" textAnchor="middle" className="degree-label">
        90°
      </text>
      <text x="13" y="154" textAnchor="middle" className="degree-label">
        180°
      </text>
      <text x="150" y="294" textAnchor="middle" className="degree-label">
        270°
      </text>
    </svg>
  );
}

const presets = [
  { label: "Rotation inverse", t: 1, te: 1.9 },
  { label: "Immobilité", t: 1, te: 1 },
  { label: "Sens direct", t: 1, te: 1.1 },
  { label: "Cas ambigu", t: 1, te: 1.5 },
];

export default function App() {
  const [rotationPeriod, setRotationPeriod] = useState(1);
  const [flashPeriod, setFlashPeriod] = useState(1.9);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [traces, setTraces] = useState(true);
  const frame = useRef(0);
  const physics = stroboscopy(rotationPeriod, flashPeriod);
  const flashIndex = flashIndexAt(time, flashPeriod);
  const samples = flashSamples(flashIndex, rotationPeriod, flashPeriod);
  const latest = samples[samples.length - 1];
  const realAngle = phaseAt(time, rotationPeriod);
  const progress = Math.max(0, Math.min(1, (time - latest.time) / flashPeriod));
  const direction = physics.ambiguous
    ? "Sens indéterminé"
    : physics.minimalStep === 0
      ? "Immobilité apparente"
      : physics.minimalStep < 0
        ? "Rotation inverse"
        : "Rotation directe";
  const isFlashing = running && time - latest.time < 0.09;

  useEffect(() => {
    if (!running) return;
    let previous: number | undefined;
    const tick = (now: number) => {
      if (previous !== undefined) {
        const elapsed = (now - previous) / 1000;
        setTime((value) => value + elapsed);
      }
      previous = now;
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    // Suspend when the tab is hidden: do not jump over unseen flashes on return.
    const onVisibility = () => {
      if (document.hidden) setRunning(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [running]);

  function reset() {
    setRunning(false);
    setTime(0);
  }
  function updatePeriod(which: "rotation" | "flash", value: number) {
    reset();
    if (which === "rotation") setRotationPeriod(value);
    else setFlashPeriod(value);
  }
  function selectPreset(t: number, te: number) {
    reset();
    setRotationPeriod(t);
    setFlashPeriod(te);
  }
  function step() {
    setRunning(false);
    setTime((flashIndex + 1) * flashPeriod);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Stroboscope, accueil">
          <span className="brand-mark">
            <span />
          </span>
          <span>
            strobo<span className="brand-light">scope</span>
            <span className="brand-dot">.</span>
          </span>
        </a>
        <div className="header-caption">LE LABORATOIRE DU MOUVEMENT</div>
        <span className="header-badge">
          <span /> Simulation interactive
        </span>
      </header>
      <main>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span /> PHYSIQUE · OPTIQUE · PERCEPTION
            </div>
            <h1>
              Un disque. Des éclairs.
              <br />
              <span>Une autre perception.</span>
            </h1>
            <p>
              Explorez comment un éclairage intermittent transforme
              <br className="desktop-break" /> notre perception d’un mouvement
              de rotation.
            </p>
          </div>
          <div className="intro-note">
            <span className="note-icon">↺</span>
            <p>
              Le disque tourne toujours dans le même sens.
              <br />
              <strong>Ce que vous observez peut raconter autre chose.</strong>
            </p>
          </div>
        </section>
        <section className="workspace" aria-label="Laboratoire interactif">
          <aside className="control-panel panel">
            <div className="panel-heading">
              <h2>Les paramètres</h2>
              <span className="section-number">01</span>
            </div>
            <PeriodControl
              label="Période de rotation"
              symbol="T"
              value={rotationPeriod}
              onChange={(value) => updatePeriod("rotation", value)}
              description="Le temps nécessaire pour effectuer un tour."
            />
            <PeriodControl
              label="Période des éclairs"
              symbol="Te"
              value={flashPeriod}
              onChange={(value) => updatePeriod("flash", value)}
              description="Le temps qui sépare deux éclairs."
            />
            <div className="control-actions">
              <button
                className="primary-button"
                onClick={() => setRunning((value) => !value)}
              >
                <Icon name={running ? "pause" : "play"} />
                {running ? "Arrêter" : time > 0 ? "Reprendre" : "Démarrer"}
              </button>
              <button
                className="icon-button"
                onClick={reset}
                aria-label="Réinitialiser"
                title="Réinitialiser"
              >
                <Icon name="reset" />
              </button>
            </div>
            <button className="step-button" onClick={step}>
              <Icon name="step" /> Avancer d’un éclair{" "}
              <span>
                + T<sub>e</sub>
              </span>
            </button>
            <p className="control-note">
              Modifier une période remet l’expérience à zéro.
            </p>
            <div className="preset-section">
              <h3>À expérimenter</h3>
              <div className="presets">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    aria-pressed={
                      rotationPeriod === preset.t && flashPeriod === preset.te
                    }
                    onClick={() => selectPreset(preset.t, preset.te)}
                  >
                    {preset.label}
                    <Icon name="arrow" />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="observation-area">
            <div className="observation-toolbar">
              <h2>Observer & comparer</h2>
              <span className={`simulation-status ${running ? "running" : ""}`}>
                <span />
                {running
                  ? "En cours"
                  : time === 0
                    ? "Prêt à explorer"
                    : "En pause"}
              </span>
            </div>
            <div className="disk-grid">
              <section className="disk-card real-card panel">
                <div className="disk-card-heading">
                  <div>
                    <span className="eyebrow mint">EN LUMIÈRE CONTINUE</span>
                    <h3>Rotation réelle</h3>
                  </div>
                  <span className="direction-icon mint">↺</span>
                </div>
                <Disk
                  angle={realAngle}
                  samples={samples}
                  delta={physics.minimalStep}
                  traces={false}
                />
                <div className="disk-stats">
                  <div>
                    <span>Position instantanée</span>
                    <strong data-testid="real-angle">
                      {number(realAngle)}
                      <small>°</small>
                    </strong>
                  </div>
                  <span className="direction-tag">↺ Sens antihoraire</span>
                </div>
                <div className="card-caption">
                  <span className="legend-dot mint-bg" />
                  Mouvement continu · {number(physics.actualFrequency, 3)}{" "}
                  tour/s
                </div>
              </section>
              <section
                className={`disk-card apparent-card panel ${isFlashing ? "flash-active" : ""}`}
              >
                <div className="disk-card-heading">
                  <div>
                    <span className="eyebrow coral">SOUS LE STROBOSCOPE</span>
                    <h3>Mouvement apparent</h3>
                  </div>
                  <span className={`flash-icon ${isFlashing ? "lit" : ""}`}>
                    <Icon name="bolt" />
                  </span>
                </div>
                <Disk
                  angle={latest.angle}
                  apparent
                  samples={samples}
                  delta={physics.minimalStep}
                  traces={traces}
                />
                <div className="disk-stats">
                  <div>
                    <span>Au dernier éclair</span>
                    <strong data-testid="apparent-angle">
                      {number(latest.angle)}
                      <small>°</small>
                    </strong>
                  </div>
                  <span className="direction-tag coral-tag">
                    {physics.ambiguous
                      ? "↔"
                      : physics.minimalStep < 0
                        ? "↻"
                        : physics.minimalStep > 0
                          ? "↺"
                          : "○"}{" "}
                    {direction}
                  </span>
                </div>
                <div className="card-caption">
                  <span className="legend-dot coral-bg" />
                  Dernière observation maintenue entre les éclairs
                </div>
              </section>
            </div>
            <div className="playback-bar panel">
              <div className="time-readout">
                <span>TEMPS ÉCOULÉ</span>
                <strong data-testid="elapsed">
                  {number(time, 3)} <small>s</small>
                </strong>
              </div>
              <div className="flash-progress">
                <div>
                  <span>Prochain éclair</span>
                  <strong>
                    {number(Math.max(0, flashPeriod - (time - latest.time)), 3)}{" "}
                    s
                  </strong>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${progress * 100}%` }} />
                </div>
              </div>
              <div className="flash-count">
                <Icon name="bolt" />
                <div>
                  <strong data-testid="flash-count">{flashIndex + 1}</strong>
                  <span>observations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="analysis-grid">
          <div className="insight-panel panel">
            <div className="panel-heading">
              <h2>Ce que les éclairs révèlent</h2>
              <span className="section-number">02</span>
            </div>
            <div className="insight-result">
              <div>
                <span className="result-label">DÉCALAGE APPARENT MINIMAL</span>
                <strong data-testid="minimal-step">
                  {physics.ambiguous ? "±180" : signed(physics.minimalStep)}
                  <span>°</span>
                </strong>
                <span className="result-subtitle">entre deux éclairs</span>
              </div>
              <span className="result-orbit">
                {physics.ambiguous
                  ? "↔"
                  : physics.minimalStep === 0
                    ? "○"
                    : physics.minimalStep < 0
                      ? "↻"
                      : "↺"}
              </span>
            </div>
            <p className="insight-copy" data-testid="explanation">
              {physics.ambiguous ? (
                "Les positions sont diamétralement opposées. +180° et −180° sont également plausibles : les éclairs ne permettent pas de choisir un sens."
              ) : physics.minimalStep === 0 ? (
                `Le disque effectue ${number(flashPeriod / rotationPeriod)} tour(s) entre deux éclairs. Le point réapparaît au même endroit : il semble immobile.`
              ) : physics.minimalStep < 0 ? (
                <>
                  Le disque avance de{" "}
                  <strong>{number(physics.actualStep)}°</strong> entre deux
                  éclairs. Le chemin le plus court entre les positions observées
                  est de <strong>{signed(physics.minimalStep)}°</strong> : le
                  point semble reculer.
                </>
              ) : (
                <>
                  Le disque avance de{" "}
                  <strong>{number(physics.actualStep)}°</strong> entre deux
                  éclairs. Le chemin le plus court est de{" "}
                  <strong>{signed(physics.minimalStep)}°</strong> : le point
                  semble avancer.
                </>
              )}
            </p>
            <div className="frequency-line">
              <span>Fréquence apparente minimale</span>
              <strong>
                {physics.ambiguous
                  ? `±${number(Math.abs(physics.apparentFrequency), 6)}`
                  : signed(physics.apparentFrequency, 6)}{" "}
                Hz
              </strong>
            </div>
          </div>
          <div className="history-panel panel">
            <div className="panel-heading">
              <h2>Éclair après éclair</h2>
              <label className="trace-toggle">
                <input
                  type="checkbox"
                  checked={traces}
                  onChange={(event) => setTraces(event.target.checked)}
                />
                <span className="toggle-track" />
                Traces
              </label>
            </div>
            <p className="history-description">
              Les huit dernières positions observées. L’éclair initial est pris
              à t = 0.
            </p>
            <div className="sample-timeline" data-testid="sample-timeline">
              {samples.map((sample, index) => (
                <div
                  className={`sample ${index === samples.length - 1 ? "latest" : ""}`}
                  key={sample.index}
                >
                  <span className="sample-index">n = {sample.index}</span>
                  <svg viewBox="0 0 56 56" aria-hidden="true">
                    <circle
                      cx="28"
                      cy="28"
                      r="21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M28 28H49"
                      stroke="currentColor"
                      strokeDasharray="2 3"
                    />
                    <line
                      x1="28"
                      y1="28"
                      x2={28 + 21 * Math.cos((sample.angle * Math.PI) / 180)}
                      y2={28 - 21 * Math.sin((sample.angle * Math.PI) / 180)}
                      stroke="#ff9298"
                      strokeOpacity="0.4"
                    />
                    <circle
                      cx={28 + 21 * Math.cos((sample.angle * Math.PI) / 180)}
                      cy={28 - 21 * Math.sin((sample.angle * Math.PI) / 180)}
                      r="3.5"
                      fill="#ff9298"
                    />
                  </svg>
                  <strong>{number(sample.angle)}°</strong>
                  <span className="sample-time">{number(sample.time)} s</span>
                </div>
              ))}
            </div>
            <div className="history-footer">
              <Icon name="bolt" />
              <span>
                Échantillonnage toutes les{" "}
                <strong>{number(flashPeriod)} s</strong>
              </span>
              <span className="memory-note">Positions mémorisées</span>
            </div>
          </div>
        </section>

        <section className="science-note">
          <span className="science-symbol">∑</span>
          <div>
            <h2>Une observation, plusieurs mouvements possibles.</h2>
            <p>
              À vitesse constante, les éclairs ne donnent l’angle qu’à un nombre
              entier de tours près :{" "}
              <span className="formula">
                Δθ = 360° × T<sub>e</sub> / T (mod 360°)
              </span>
              . Tous les déplacements{" "}
              <span className="formula">
                Δθ<sub>min</sub> + 360° × k
              </span>
              , avec k entier, produisent les mêmes observations. Le déplacement
              minimal est une interprétation, pas une mesure certaine du
              mouvement réel.
            </p>
            <p className="science-detail">
              Convention : angles positifs dans le sens antihoraire. Éclairs
              idéaux instantanés ; disque à vitesse constante. Les traces et la
              dernière position restent affichées pour faciliter la lecture.
              L’animation à l’écran peut elle-même être sous-échantillonnée aux
              très petites périodes ; les calculs et le mode pas à pas restent
              exacts.
            </p>
          </div>
        </section>
        <footer>
          <span>
            stroboscope. <span>Voir le mouvement autrement.</span>
          </span>
          <span>Un laboratoire pour comprendre, un éclair à la fois.</span>
        </footer>
      </main>
    </div>
  );
}
