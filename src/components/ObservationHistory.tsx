import { useEffect, useRef } from "react";
import type { flashSamples } from "../physics";
import { number } from "../format";
import { Zap } from "lucide-react";

export function ObservationHistory({
  samples,
}: {
  samples: ReturnType<typeof flashSamples>;
}) {
  const scroll = useRef<HTMLDivElement>(null);
  const index = samples.at(-1)!.index;
  useEffect(() => {
    const el = scroll.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [index]);
  return (
    <section className="history-section" aria-labelledby="history-title">
      <div className="history-heading">
        <h3 id="history-title">
          <Zap size={15} /> Éclair après éclair
        </h3>
        <span>Les 8 dernières observations · éclair initial à t = 0</span>
      </div>
      <div
        className="sample-timeline"
        data-testid="sample-timeline"
        ref={scroll}
      >
        {samples.map((sample, i) => (
          <div
            className={`sample ${i === samples.length - 1 ? "latest" : ""}`}
            key={sample.index}
          >
            <span className="sample-index">n = {sample.index}</span>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <circle className="history-ring" cx="24" cy="24" r="18" />
              <path className="history-axis" d="M24 24H42" />
              <circle
                cx={24 + 18 * Math.cos((sample.angle * Math.PI) / 180)}
                cy={24 - 18 * Math.sin((sample.angle * Math.PI) / 180)}
                r="3.5"
                className="red-point"
              />
            </svg>
            <strong>{number(sample.angle)}°</strong>
            <span className="sample-time">{number(sample.time)} s</span>
          </div>
        ))}
      </div>
    </section>
  );
}
