/** Positive angles are counterclockwise. Periods are in seconds. */
export const MIN_PERIOD = 0.05;
export const MAX_PERIOD = 10;

export function validPeriod(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_PERIOD && value <= MAX_PERIOD;
}

export function wrapDegrees(angle: number): number {
  const result = ((angle % 360) + 360) % 360;
  return Math.abs(result - 360) < 1e-9 || Math.abs(result) < 1e-9 ? 0 : result;
}

export function stroboscopy(rotationPeriod: number, flashPeriod: number) {
  if (!validPeriod(rotationPeriod) || !validPeriod(flashPeriod)) {
    throw new RangeError(
      "Les périodes doivent être comprises entre 0,05 et 10 secondes.",
    );
  }
  const actualStep = (360 * flashPeriod) / rotationPeriod;
  const phase = wrapDegrees(actualStep);
  // The antipodal case has two equally short displacements: +180° and −180°.
  const ambiguous = Math.abs(phase - 180) < 1e-9;
  const minimalStep = ambiguous ? 180 : phase > 180 ? phase - 360 : phase;
  return {
    actualStep,
    minimalStep,
    ambiguous,
    apparentFrequency: minimalStep / (360 * flashPeriod),
    actualFrequency: 1 / rotationPeriod,
  };
}

export function phaseAt(time: number, rotationPeriod: number): number {
  return wrapDegrees((360 * time) / rotationPeriod);
}

export function flashIndexAt(time: number, flashPeriod: number): number {
  // Small tolerance prevents a represented flash time (e.g. 3 × 0.1) being missed.
  return Math.floor(time / flashPeriod + 1e-10);
}

export function flashSamples(
  index: number,
  rotationPeriod: number,
  flashPeriod: number,
  limit = 8,
) {
  const start = Math.max(0, index - limit + 1);
  return Array.from({ length: index - start + 1 }, (_, offset) => {
    const n = start + offset;
    return {
      index: n,
      time: n * flashPeriod,
      angle: phaseAt(n * flashPeriod, rotationPeriod),
    };
  });
}
