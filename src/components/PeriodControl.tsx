import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { MAX_PERIOD, MIN_PERIOD, validPeriod } from "../physics";
import { number } from "../format";

export function PeriodControl({
  label,
  symbol,
  value,
  onChange,
}: {
  label: string;
  symbol: "T" | "Te";
  value: number;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const invalid = draft === "" || !validPeriod(Number(draft));
  const fraction =
    (Math.log10(value) - Math.log10(MIN_PERIOD)) /
    Math.log10(MAX_PERIOD / MIN_PERIOD);
  function keyboard(event: KeyboardEvent<HTMLInputElement>) {
    const increments: Record<string, number> = {
      ArrowRight: 0.001,
      ArrowUp: 0.001,
      ArrowLeft: -0.001,
      ArrowDown: -0.001,
      PageUp: 0.01,
      PageDown: -0.01,
    };
    const next =
      event.key === "Home"
        ? MIN_PERIOD
        : event.key === "End"
          ? MAX_PERIOD
          : event.key in increments
            ? value + increments[event.key]
            : undefined;
    if (next !== undefined) {
      event.preventDefault();
      onChange(
        Math.max(
          MIN_PERIOD,
          Math.min(MAX_PERIOD, Math.round(next * 1000) / 1000),
        ),
      );
    }
  }
  return (
    <div className="period-control">
      <label htmlFor={`period-${symbol}`}>
        {label}
        <span className="parameter-symbol">
          {symbol === "T" ? (
            "T"
          ) : (
            <>
              T<sub>e</sub>
            </>
          )}
        </span>
      </label>
      <div className={`period-value ${invalid ? "invalid" : ""}`}>
        <input
          id={`period-${symbol}`}
          type="number"
          inputMode="decimal"
          min={MIN_PERIOD}
          max={MAX_PERIOD}
          step="0.001"
          value={draft}
          aria-invalid={invalid}
          aria-describedby={`help-${symbol}`}
          onChange={(event) => {
            setDraft(event.target.value);
            const next = Number(event.target.value);
            if (event.target.value !== "" && validPeriod(next)) onChange(next);
          }}
          onBlur={() => {
            if (invalid) setDraft(String(value));
          }}
        />
        <span>s</span>
        <small>{number(1 / value)} Hz</small>
      </div>
      <input
        className="period-slider"
        type="range"
        min={Math.log10(MIN_PERIOD)}
        max={Math.log10(MAX_PERIOD)}
        step="any"
        value={Math.log10(value)}
        aria-label={`Régler ${label.toLowerCase()}`}
        aria-valuetext={`${number(value)} secondes`}
        aria-describedby={`slider-help-${symbol}`}
        style={{ "--fill": `${fraction * 100}%` } as CSSProperties}
        onChange={(event) =>
          onChange(
            Math.max(
              MIN_PERIOD,
              Math.min(
                MAX_PERIOD,
                Math.round(10 ** Number(event.target.value) * 1000) / 1000,
              ),
            ),
          )
        }
        onKeyDown={keyboard}
      />
      <div className="slider-endpoints">
        <span>0,001 s</span>
        <span>10 s</span>
      </div>
      <span className="sr-only" id={`slider-help-${symbol}`}>
        Échelle logarithmique. Flèches : un pas de 0,001 s ; Page haut ou bas :
        0,01 s ; Début et Fin : valeurs limites.
      </span>
      <p
        id={`help-${symbol}`}
        className={invalid ? "input-error" : "parameter-help"}
      >
        {invalid
          ? "Choisissez une valeur entre 0,001 et 10 s."
          : symbol === "T"
            ? "La durée d’un tour complet."
            : "L’intervalle entre deux éclairs."}
      </p>
    </div>
  );
}
