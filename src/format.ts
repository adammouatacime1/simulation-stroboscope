export const number = (value: number, digits = 3) =>
  value.toLocaleString("fr-FR", { maximumFractionDigits: digits });

export const signed = (value: number, digits = 3) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${number(Math.abs(value), digits)}`;

export function apparentDirection(step: number, ambiguous: boolean) {
  return ambiguous
    ? "Indéterminé"
    : step === 0
      ? "Stationnaire"
      : step < 0
        ? "Inverse"
        : "Direct";
}
