import { useEffect, useRef, useState } from "react";
import {
  CircleHelp,
  Moon,
  RotateCcw,
  Sun,
  X,
  Lightbulb,
  Keyboard,
} from "lucide-react";
import type { Theme } from "../useTheme";

export function AppHeader({
  theme,
  onTheme,
  onReset,
}: {
  theme: Theme;
  onTheme: () => void;
  onReset: () => void;
}) {
  const [help, setHelp] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (help) dialog.current?.showModal();
    else dialog.current?.close();
  }, [help]);
  return (
    <>
      <a className="skip-link" href="#laboratoire">
        Aller à la simulation
      </a>
      <header className="app-header glass">
        <a
          href="#laboratoire"
          className="brand"
          aria-label="Stroboscope Lab, simulation"
        >
          <svg className="lab-mark" viewBox="0 0 40 40" aria-hidden="true">
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="20"
              cy="20"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity=".25"
            />
            <path
              d="M20 20 32 11"
              stroke="currentColor"
              strokeWidth="1"
              opacity=".4"
            />
            <circle
              cx="32"
              cy="11"
              r="4"
              fill="var(--point)"
              stroke="var(--surface)"
              strokeWidth="2"
            />
          </svg>
          <span>
            <strong>
              Stroboscope <span>Lab</span>
            </strong>
            <small>Laboratoire de physique</small>
          </span>
        </a>
        <nav aria-label="Outils du laboratoire">
          <button
            className="icon-button"
            onClick={onTheme}
            aria-label={
              theme === "light"
                ? "Activer le mode sombre"
                : "Activer le mode clair"
            }
            title={theme === "light" ? "Mode sombre" : "Mode clair"}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button
            className="icon-button"
            onClick={() => setHelp(true)}
            aria-label="Aide"
            title="Comprendre la simulation"
          >
            <CircleHelp size={20} />
          </button>
          <span className="nav-divider" />
          <button
            className="icon-button"
            onClick={onReset}
            aria-label="Réinitialiser toute l’expérience"
            title="Rétablir les réglages initiaux"
          >
            <RotateCcw size={19} />
          </button>
        </nav>
      </header>
      <dialog
        className="help-dialog"
        ref={dialog}
        onClose={() => setHelp(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setHelp(false);
        }}
        aria-labelledby="help-title"
      >
        <button
          className="icon-button dialog-close"
          onClick={() => setHelp(false)}
          aria-label="Fermer l’aide"
        >
          <X size={20} />
        </button>
        <span className="dialog-symbol">
          <Lightbulb size={28} />
        </span>
        <h2 id="help-title">Un éclair pour comprendre.</h2>
        <p>
          Le disque tourne à vitesse constante dans le sens antihoraire. Le
          stroboscope ne révèle son point rouge qu’à des instants espacés de Tₑ.
        </p>
        <h3>Deux périodes indépendantes</h3>
        <p>
          <strong>T</strong> est la durée d’un tour. <strong>Tₑ</strong> est le
          temps entre deux éclairs. Les modifier remet le temps à zéro pour
          garder des observations cohérentes.
        </p>
        <h3>Une observation, plusieurs interprétations</h3>
        <p>
          Avec T = 1 s et Tₑ = 1,9 s, le disque avance réellement de 684°. Le
          plus court chemin observé est pourtant −36°. Tous les déplacements Δθ
          <sub>min</sub> + 360° × k, avec k entier, sont compatibles avec ces
          mêmes observations.
        </p>
        <p>
          À ±180°, les deux sens sont également possibles. L’immobilité
          apparente ne signifie pas un arrêt réel.
        </p>
        <h3>Les aides de lecture</h3>
        <p>
          La rémanence conserve la dernière position ; les traces mémorisent les
          huit dernières. Ce sont des aides graphiques. Les éclairs physiques du
          modèle sont instantanés, l’indicateur visuel est bref. Le graphique
          sépare les tours au passage 360° → 0°.
        </p>
        <p>
          Le ralenti modifie seulement la vitesse du temps simulé, jamais T, Tₑ
          ou les calculs. À haute fréquence, l’écran peut manquer des éclairs :
          utilisez « Éclair suivant » pour examiner chaque mesure.
        </p>
        <div className="keyboard-note">
          <Keyboard size={18} />
          <span>
            Tab pour naviguer · flèches pour ajuster les périodes · Échap pour
            fermer.
          </span>
        </div>
      </dialog>
    </>
  );
}
