import { useEffect, useRef, useState } from "react";
import { ChartNoAxesCombined, Info } from "lucide-react";
import { angleSegments } from "../chartModel";
import { flashIndexAt, flashSamples, stroboscopy } from "../physics";
import { number, signed } from "../format";
import { Toggle } from "./SimulationPanel";

export function AnalysisChart({
  time,
  rotationPeriod,
  flashPeriod,
}: {
  time: number;
  rotationPeriod: number;
  flashPeriod: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const [windowMode, setWindowMode] = useState("flashes");
  const [compare, setCompare] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.max(260, entries[0].contentRect.width)),
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const height = 246;
  const margin = { left: 42, right: 24, top: 20, bottom: 36 };
  const span = windowMode === "flashes" ? 6 * flashPeriod : 2 * rotationPeriod;
  const end = Math.max(span, time);
  const start = Math.max(0, end - span);
  const x = (t: number) =>
    margin.left + ((t - start) / span) * (width - margin.left - margin.right);
  const y = (a: number) =>
    height - margin.bottom - (a / 360) * (height - margin.top - margin.bottom);
  const real = angleSegments(
    start,
    end,
    (360 * start) / rotationPeriod,
    (360 * end) / rotationPeriod,
  );
  const flashIndex = flashIndexAt(time, flashPeriod);
  // Bound DOM size even when the two-turn window contains thousands of flashes.
  const firstIndex = Math.max(0, Math.ceil(start / flashPeriod - 1e-10));
  const stride = Math.max(1, Math.ceil((flashIndex - firstIndex + 1) / 60));
  const visibleIndices: number[] = [];
  for (let i = firstIndex; i <= flashIndex; i += stride)
    if (i * flashPeriod <= end) visibleIndices.push(i);
  if (flashIndex * flashPeriod >= start && !visibleIndices.includes(flashIndex))
    visibleIndices.push(flashIndex);
  const samples = visibleIndices.map(
    (n) => flashSamples(n, rotationPeriod, flashPeriod, 1)[0],
  );
  const lastTwo = flashSamples(flashIndex, rotationPeriod, flashPeriod, 2);
  const last = lastTwo.at(-1)!;
  const previous = lastTwo.at(-2);
  const physics = stroboscopy(rotationPeriod, flashPeriod);
  const alias =
    previous && !physics.ambiguous
      ? angleSegments(
          previous.time,
          last.time,
          previous.angle,
          previous.angle + physics.minimalStep,
          start,
          end,
        ).segments
      : [];
  const tip =
    samples.find((sample) => sample.index === hovered) ?? samples.at(-1);
  return (
    <section className="temporal-section" aria-labelledby="chart-title">
      <div className="section-heading">
        <div>
          <h2 id="chart-title">Analyse temporelle</h2>
          <p>Le mouvement continu, les instants qui le révèlent.</p>
        </div>
        <ChartNoAxesCombined size={23} className="muted-icon" />
      </div>
      <div className="chart-panel surface">
        <div className="chart-toolbar">
          <div className="chart-legend">
            <span>
              <i className="line-key real-line-key" />
              Angle réel théorique
            </span>
            <span>
              <i className="point-key" />
              Positions observées
            </span>
            <span>
              <i className="line-key alias-line-key" />
              Trajet minimal choisi
            </span>
          </div>
          <label className="chart-window">
            <span className="sr-only">Fenêtre du graphique</span>
            <select
              aria-label="Fenêtre du graphique"
              value={windowMode}
              onChange={(event) => setWindowMode(event.target.value)}
            >
              <option value="flashes">6 intervalles d’éclair</option>
              <option value="turns">2 tours réels</option>
            </select>
          </label>
        </div>
        <div className="chart-axis-title">ANGLE MODULO 360°</div>
        <div className="chart-container" ref={container}>
          <svg
            className="angle-chart"
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            aria-label="Angle modulo 360 degrés en fonction du temps simulé. La courbe réelle est coupée à chaque tour. Les points sont les mesures aux éclairs."
          >
            <defs>
              <clipPath id="chart-clip">
                <rect
                  x={margin.left - 8}
                  y={margin.top - 5}
                  width={width - margin.left - margin.right + 16}
                  height={height - margin.top - margin.bottom + 10}
                />
              </clipPath>
            </defs>
            {[0, 90, 180, 270, 360].map((angle) => (
              <g key={angle}>
                <line
                  className="chart-gridline"
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={y(angle)}
                  y2={y(angle)}
                />
                <text
                  className="chart-label"
                  x={margin.left - 10}
                  y={y(angle) + 4}
                  textAnchor="end"
                >
                  {angle}°
                </text>
              </g>
            ))}
            {Array.from({ length: width < 500 ? 4 : 7 }, (_, i) => {
              const count = width < 500 ? 3 : 6;
              const t = start + (i * span) / count;
              return (
                <g key={i}>
                  <line
                    className="chart-gridline vertical-grid"
                    x1={x(t)}
                    x2={x(t)}
                    y1={margin.top}
                    y2={height - margin.bottom}
                  />
                  <text
                    className="chart-label"
                    x={x(t)}
                    y={height - 12}
                    textAnchor="middle"
                  >
                    {number(t)} s
                  </text>
                </g>
              );
            })}
            <g clipPath="url(#chart-clip)">
              {real.segments.map((segment, i) => (
                <path
                  data-testid="real-curve-segment"
                  key={i}
                  d={`M${x(segment.start.time)},${y(segment.start.angle)}L${x(segment.end.time)},${y(segment.end.angle)}`}
                  className="real-curve"
                />
              ))}
              {samples.map((sample) => (
                <line
                  key={sample.index}
                  x1={x(sample.time)}
                  x2={x(sample.time)}
                  y1={margin.top}
                  y2={height - margin.bottom}
                  className="flash-line"
                />
              ))}
              {compare &&
                alias.map((segment, i) => (
                  <path
                    data-testid="alias-curve-segment"
                    key={i}
                    d={`M${x(segment.start.time)},${y(segment.start.angle)}L${x(segment.end.time)},${y(segment.end.angle)}`}
                    className="alias-curve"
                  />
                ))}
              <line
                x1={x(time)}
                x2={x(time)}
                y1={margin.top}
                y2={height - margin.bottom}
                className="current-time-line"
              />
              {samples.map((sample) => (
                <circle
                  key={sample.index}
                  className={`chart-sample ${tip?.index === sample.index ? "focused-sample" : ""}`}
                  cx={x(sample.time)}
                  cy={y(sample.angle)}
                  r="5"
                  tabIndex={0}
                  role="button"
                  aria-label={`Éclair ${sample.index}, temps ${number(sample.time)} secondes, angle ${number(sample.angle)} degrés`}
                  onMouseEnter={() => setHovered(sample.index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(sample.index)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setHovered(sample.index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setHovered(sample.index);
                    }
                  }}
                />
              ))}
            </g>
          </svg>
          {real.dense && (
            <div className="chart-density" role="status">
              <Info size={17} />
              <span>
                Trop de tours pour tracer une courbe lisible.
                <br />
                Choisissez « 2 tours réels » pour détailler la rotation.
              </span>
            </div>
          )}
        </div>
        <div className="chart-bottom">
          <Toggle
            label="Trajet apparent minimal"
            checked={compare}
            onChange={setCompare}
          />
          <div className="chart-tooltip" data-testid="chart-tooltip">
            {tip ? (
              <>
                <span>Éclair {tip.index}</span>
                <strong>{number(tip.time)} s</strong>
                <span>·</span>
                <strong>{number(tip.angle)}°</strong>
              </>
            ) : (
              <span>Aucun éclair dans cette fenêtre</span>
            )}
          </div>
        </div>
        <div className="chart-disclaimer">
          <Info size={14} />
          <span>
            {physics.ambiguous
              ? "±180° : aucun sens ne peut être choisi ; aucun trajet apparent unique n’est tracé."
              : `Le pointillé représente uniquement la convention du plus court angle (${signed(physics.minimalStep)}° entre les deux derniers éclairs). Il ne reconstitue pas le mouvement réel.`}{" "}
            {stride > 1 &&
              "Une partie des marqueurs est masquée pour garder le graphique lisible ; les calculs et le compteur incluent tous les éclairs."}
          </span>
        </div>
      </div>
    </section>
  );
}
