import { memo, useId } from "react";
import {
  ArrowLeftRight,
  RotateCcw,
  RotateCw,
  Circle,
  Zap,
  Eye,
} from "lucide-react";
import { flashSamples, stroboscopy } from "../physics";
import { apparentDirection, number, signed } from "../format";

type Samples = ReturnType<typeof flashSamples>;
const position = (angle: number, radius = 116) => ({
  x: 180 + radius * Math.cos((angle * Math.PI) / 180),
  y: 180 - radius * Math.sin((angle * Math.PI) / 180),
});

const Disk = memo(function Disk({
  angle,
  apparent,
  samples,
  delta,
  traces,
  visible,
}: {
  angle: number;
  apparent: boolean;
  samples: Samples;
  delta: number;
  traces: boolean;
  visible: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const current = position(angle);
  const previous = samples.at(-2);
  const arcs = Math.abs(Math.abs(delta) - 180) < 1e-9 ? [180, -180] : [delta];
  return (
    <svg
      className="disk"
      viewBox="0 0 360 360"
      role="img"
      aria-label={`${apparent ? "Position au dernier éclair" : "Position réelle"} : ${number(angle)} degrés`}
    >
      <defs>
        <radialGradient id={`material-${id}`} cx="35%" cy="25%" r="85%">
          <stop offset="0" className="disk-stop-light" />
          <stop offset="1" className="disk-stop-dark" />
        </radialGradient>
        <filter
          id={`shadow-${id}`}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="6"
            floodColor="var(--disk-shadow)"
          />
        </filter>
        <marker
          id={`arrow-${id}`}
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0 0 6 3 0 6" fill="var(--apparent)" />
        </marker>
      </defs>
      <circle className="outer-guide" cx="180" cy="180" r="146" />
      {Array.from({ length: 72 }, (_, i) => {
        const a = position(i * 5, i % 6 === 0 ? 137 : 141);
        const b = position(i * 5, 146);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={i % 6 === 0 ? "major-tick" : "minor-tick"}
          />
        );
      })}
      <circle
        cx="180"
        cy="180"
        r="120"
        fill={`url(#material-${id})`}
        className="disk-rim"
        filter={`url(#shadow-${id})`}
      />
      <circle className="orbit-guide" cx="180" cy="180" r="116" />
      <circle className="inner-guide" cx="180" cy="180" r="80" />
      <path className="crosshair" d="M60 180H300M180 60V300" />
      {!apparent && (
        <g transform={`rotate(${-angle} 180 180)`}>
          <path className="rotating-radius" d="M180 180H296" />
          <path className="opposite-radius" d="M180 180H64" />
        </g>
      )}
      {apparent &&
        traces &&
        samples.slice(0, -1).map((sample, index) => {
          const p = position(sample.angle);
          const label = position(sample.angle, 99);
          return (
            <g
              key={sample.index}
              opacity={0.18 + (0.5 * index) / samples.length}
            >
              <circle cx={p.x} cy={p.y} r="5" className="sample-dot" />
              <text
                x={label.x}
                y={label.y + 3}
                className="sample-label"
                textAnchor="middle"
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
        arcs.map((arc, i) => {
          const a = position(previous.angle, 88);
          const b = position(previous.angle + arc, 88);
          return (
            <path
              key={arc}
              data-testid={i === 0 ? "apparent-arc" : undefined}
              d={`M${a.x},${a.y} A88,88 0 0 ${arc > 0 ? 0 : 1} ${b.x},${b.y}`}
              className="apparent-arc"
              markerEnd={`url(#arrow-${id})`}
            />
          );
        })}
      <circle cx="180" cy="180" r="7" className="hub" />
      <circle cx="180" cy="180" r="2" className="hub-dot" />
      {visible && (
        <g data-testid={apparent ? "observed-point" : "real-point"}>
          <circle cx={current.x} cy={current.y} r="12" className="point-halo" />
          <circle cx={current.x} cy={current.y} r="6" className="red-point" />
        </g>
      )}
      <text x="337" y="184" className="degree-label" textAnchor="middle">
        0°
      </text>
      <text x="180" y="22" className="degree-label" textAnchor="middle">
        90°
      </text>
      <text x="23" y="184" className="degree-label" textAnchor="middle">
        180°
      </text>
      <text x="180" y="346" className="degree-label" textAnchor="middle">
        270°
      </text>
      {!apparent && (
        <path
          className="rotation-arrow"
          d="M259 79 A128 128 0 0 0 237 66m5-1-5 1 2 5"
        />
      )}
    </svg>
  );
});

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-track" />
      <span>{label}</span>
    </label>
  );
}

export function SimulationPanel({
  apparent = false,
  angle,
  samples,
  physics,
  traces,
  persistence,
  atFlash,
  onTraces,
  onPersistence,
}: {
  apparent?: boolean;
  angle: number;
  samples: Samples;
  physics: ReturnType<typeof stroboscopy>;
  traces: boolean;
  persistence: boolean;
  atFlash: boolean;
  onTraces: (value: boolean) => void;
  onPersistence: (value: boolean) => void;
}) {
  const direction = apparentDirection(physics.minimalStep, physics.ambiguous);
  const DirectionIcon = physics.ambiguous
    ? ArrowLeftRight
    : physics.minimalStep === 0
      ? Circle
      : physics.minimalStep < 0
        ? RotateCw
        : RotateCcw;
  return (
    <section
      className={`simulation-panel surface ${apparent ? "apparent-panel" : "real-panel"}`}
      aria-labelledby={apparent ? "apparent-title" : "real-title"}
    >
      <div className="simulation-heading">
        <div>
          <h2 id={apparent ? "apparent-title" : "real-title"}>
            {apparent ? "Observation stroboscopique" : "Mouvement réel"}
          </h2>
          <p>
            {apparent
              ? "Positions observées aux instants des éclairs"
              : "Rotation continue du disque"}
          </p>
        </div>
        <span
          className={`panel-glyph ${apparent && atFlash ? "flash-lit" : ""}`}
        >
          {apparent ? <Zap size={20} /> : <RotateCcw size={21} />}
        </span>
      </div>
      <Disk
        angle={angle}
        apparent={apparent}
        samples={samples}
        delta={physics.minimalStep}
        traces={traces}
        visible={!apparent || persistence || atFlash}
      />
      <div className="disk-readouts">
        <div>
          <span>{apparent ? "Au dernier éclair" : "Position instantanée"}</span>
          <strong data-testid={apparent ? "apparent-angle" : "real-angle"}>
            {number(angle)}
            <small>°</small>
          </strong>
        </div>
        <div
          className={`direction-label ${apparent ? "apparent-color" : "real-color"}`}
        >
          {apparent ? <DirectionIcon size={16} /> : <RotateCcw size={16} />}
          <span>
            {apparent ? direction : "Antihoraire"}
            <small>
              {apparent
                ? "selon le plus court angle"
                : `ω = ${number(physics.actualFrequency * 2 * Math.PI)} rad/s`}
            </small>
          </span>
        </div>
      </div>
      <div className="panel-bottom">
        {apparent ? (
          <>
            <Toggle
              label="Positions successives"
              checked={traces}
              onChange={onTraces}
            />
            <Toggle
              label="Rémanence"
              checked={persistence}
              onChange={onPersistence}
            />
          </>
        ) : (
          <>
            <span className="legend-item">
              <span className="legend-dot real-bg" />
              Éclairage continu
            </span>
            <span className="real-frequency">
              {number(physics.actualFrequency)} tour/s
            </span>
          </>
        )}
      </div>
      <div className="panel-footnote">
        {apparent ? (
          <>
            <Eye size={13} />
            <span>
              {persistence
                ? "Dernière position conservée entre les éclairs."
                : "Point visible à l’éclair ; traces mémorisées si activées."}
            </span>
          </>
        ) : (
          <>
            <span className="positive-angle">↺</span>
            <span>Angles positifs dans le sens antihoraire.</span>
          </>
        )}
      </div>
      {apparent && (
        <span className="sr-only">
          Déplacement apparent minimal :{" "}
          {physics.ambiguous
            ? "plus ou moins 180"
            : signed(physics.minimalStep)}{" "}
          degrés.
        </span>
      )}
    </section>
  );
}
