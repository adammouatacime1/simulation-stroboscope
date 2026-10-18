import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { flashIndexAt, flashSamples, phaseAt, stroboscopy } from "./physics";
import { useSimulation } from "./useSimulation";
import { useTheme } from "./useTheme";
import { AppHeader } from "./components/AppHeader";
import { SimulationPanel } from "./components/SimulationPanel";
import { PlaybackControls } from "./components/PlaybackControls";
import { MetricsPanel } from "./components/MetricsPanel";
import { ExperimentPresets, experiments } from "./components/ExperimentPresets";
import { AnalysisChart } from "./components/AnalysisChart";
import { ObservationHistory } from "./components/ObservationHistory";

export default function App() {
  const sim = useSimulation();
  const { theme, toggle } = useTheme();
  const [traces, setTraces] = useState(true);
  const [persistence, setPersistence] = useState(true);
  const [experiment, setExperiment] = useState("free");
  const physics = useMemo(
    () => stroboscopy(sim.rotationPeriod, sim.flashPeriod),
    [sim.rotationPeriod, sim.flashPeriod],
  );
  const flashIndex = flashIndexAt(sim.time, sim.flashPeriod);
  const samples = useMemo(
    () => flashSamples(flashIndex, sim.rotationPeriod, sim.flashPeriod),
    [flashIndex, sim.rotationPeriod, sim.flashPeriod],
  );
  const latest = samples.at(-1)!;
  // Ideal flashes are sampled exactly; this short graphical pulse is an aid only.
  const atFlash =
    sim.time - latest.time < 1e-9 ||
    (sim.running &&
      sim.time - latest.time <
        Math.min(0.035 * sim.speed, sim.flashPeriod * 0.15));
  function resetAll() {
    sim.configure(1, 1.9);
    sim.setSpeed(1);
    setExperiment("free");
    setTraces(true);
    setPersistence(true);
  }
  function updatePeriod(which: "rotation" | "flash", value: number) {
    setExperiment("free");
    sim.configure(
      which === "rotation" ? value : sim.rotationPeriod,
      which === "flash" ? value : sim.flashPeriod,
    );
  }
  function selectExperiment(id: string) {
    setExperiment(id);
    if (id === "free") document.getElementById("period-T")?.focus();
    else {
      const preset = experiments.find((item) => item.id === id)!;
      sim.configure(preset.t, preset.te);
    }
  }
  const panelProps = {
    samples,
    physics,
    traces,
    persistence,
    atFlash,
    onTraces: setTraces,
    onPersistence: setPersistence,
  };
  return (
    <div className="app-shell">
      <AppHeader theme={theme} onTheme={toggle} onReset={resetAll} />
      <main id="laboratoire" tabIndex={-1}>
        <section className="intro">
          <span className="intro-kicker">
            <span />
            Simulation interactive <i>·</i> Mouvement circulaire uniforme
          </span>
          <h1>Explorez le mouvement.</h1>
          <p>
            Découvrez comment des éclairs périodiques peuvent transformer
            <br className="desktop-break" /> la perception d’un mouvement
            circulaire.
          </p>
        </section>
        <div className="simulation-grid">
          <SimulationPanel
            angle={phaseAt(sim.time, sim.rotationPeriod)}
            {...panelProps}
          />
          <SimulationPanel apparent angle={latest.angle} {...panelProps} />
        </div>
        <PlaybackControls simulation={sim} onPeriod={updatePeriod} />
        <ExperimentPresets active={experiment} onSelect={selectExperiment} />
        <MetricsPanel
          physics={physics}
          rotationPeriod={sim.rotationPeriod}
          flashPeriod={sim.flashPeriod}
        />
        <AnalysisChart
          time={sim.time}
          rotationPeriod={sim.rotationPeriod}
          flashPeriod={sim.flashPeriod}
        />
        <ObservationHistory samples={samples} />
        <div className="scientific-note">
          <Info size={16} />
          <p>
            Un modèle idéal, une lecture rigoureuse. Vitesse constante, éclairs
            instantanés, angles modulo 360°. À haute fréquence, l’écran peut
            lui-même sous-échantillonner le mouvement : utilisez le mode éclair
            par éclair. La rémanence et les traces sont des aides de lecture.
          </p>
        </div>
        <footer>
          <span className="footer-brand">
            Stroboscope Lab<span>Voir autrement. Comprendre précisément.</span>
          </span>
          <span>Physique du mouvement · Conçu pour explorer</span>
        </footer>
      </main>
    </div>
  );
}
