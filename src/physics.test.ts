import { describe, expect, it } from "vitest";
import {
  flashIndexAt,
  flashSamples,
  phaseAt,
  stroboscopy,
  validPeriod,
  wrapDegrees,
} from "./physics";

describe("Échantillonnage stroboscopique", () => {
  it("retrouve le recul de 36° lorsque Te = 1,9 T, malgré un tour complet supplémentaire", () => {
    const result = stroboscopy(1, 1.9);
    expect(result.actualStep).toBeCloseTo(684, 10);
    expect(result.minimalStep).toBeCloseTo(-36, 10);
    expect(result.apparentFrequency).toBeCloseTo(-1 / 19, 10);
    expect(result.actualFrequency).toBe(1);
    expect(result.ambiguous).toBe(false);
    expect(
      flashSamples(3, 1, 1.9).map((sample) => Math.round(sample.angle)),
    ).toEqual([0, 324, 288, 252]);
  });

  it.each([1, 2, 3, 10])(
    "donne une immobilité apparente pour Te = %s T",
    (ratio) => {
      expect(stroboscopy(1, ratio).minimalStep).toBe(0);
    },
  );

  it.each([0.5, 1.5, 2.5])(
    "signale les deux sens possibles à Te = %s T",
    (ratio) => {
      const result = stroboscopy(1, ratio);
      expect(result.ambiguous).toBe(true);
      expect(Math.abs(result.minimalStep)).toBe(180);
    },
  );

  it("distingue les deux côtés du demi-tour sans inventer un sens au cas limite", () => {
    expect(stroboscopy(1, 1.49).minimalStep).toBeCloseTo(176.4);
    expect(stroboscopy(1, 1.51).minimalStep).toBeCloseTo(-176.4);
  });

  it("conserve les positions observées pour toutes les vitesses aliasées", () => {
    for (const t of [0.001, 0.01, 0.05, 0.3, 1, 2.7, 10]) {
      for (const te of [0.001, 0.019, 0.05, 0.4, 1.1, 1.9, 10]) {
        const result = stroboscopy(t, te);
        expect(Math.abs(result.minimalStep)).toBeLessThanOrEqual(180);
        for (let n = 0; n <= 20; n++) {
          const actual = phaseAt(n * te, t);
          const alias = wrapDegrees(n * result.minimalStep);
          const error = wrapDegrees(actual - alias);
          expect(Math.min(error, 360 - error)).toBeLessThan(1e-7);
        }
      }
    }
  });

  it("gère le premier éclair, les frontières décimales et les instants entre deux éclairs", () => {
    expect(flashIndexAt(0, 1.9)).toBe(0);
    expect(flashIndexAt(1.899, 1.9)).toBe(0);
    expect(flashIndexAt(1.9, 1.9)).toBe(1);
    expect(flashIndexAt(0.3, 0.1)).toBe(3);
    expect(flashIndexAt(5.7, 1.9)).toBe(3);
    expect(flashIndexAt(0.003, 0.001)).toBe(3);
    expect(flashIndexAt(0.0029, 0.001)).toBe(2);
  });

  it("garde huit observations exactes sans accumuler les erreurs ni la mémoire", () => {
    const samples = flashSamples(10000, 1, 1.9);
    expect(samples).toHaveLength(8);
    expect(samples[0].index).toBe(9993);
    expect(samples[7]).toEqual({ index: 10000, time: 19000, angle: 0 });
  });

  it("permet les millisecondes et conserve le recul de 36° pour T = 0,01 s et Te = 0,019 s", () => {
    expect(validPeriod(0.001)).toBe(true);
    expect(stroboscopy(0.001, 0.001).minimalStep).toBe(0);
    const result = stroboscopy(0.01, 0.019);
    expect(result.actualStep).toBeCloseTo(684, 10);
    expect(result.minimalStep).toBeCloseTo(-36, 10);
    expect(result.apparentFrequency).toBeCloseTo(-100 / 19, 10);
  });

  it.each([0, -1, NaN, Infinity, 0.0009, 10.01])(
    "rejette une période invalide : %s",
    (value) => {
      expect(validPeriod(value)).toBe(false);
      expect(() => stroboscopy(value, 1)).toThrow(RangeError);
      expect(() => stroboscopy(1, value)).toThrow(RangeError);
    },
  );
});
