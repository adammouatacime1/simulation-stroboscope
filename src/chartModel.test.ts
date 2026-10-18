import { describe, expect, it } from "vitest";
import { angleSegments } from "./chartModel";

describe("Graphique angulaire modulo 360°", () => {
  it("sépare les tours réels sans ligne diagonale artificielle au repliement", () => {
    const { segments } = angleSegments(0, 1.9, 0, 684);
    expect(segments).toHaveLength(2);
    expect(segments[0].start).toEqual({ time: 0, angle: 0 });
    expect(segments[0].end.time).toBeCloseTo(1, 12);
    expect(segments[0].end.angle).toBe(360);
    expect(segments[1].start.time).toBeCloseTo(1, 12);
    expect(segments[1].start.angle).toBe(0);
    expect(segments[1].end.angle).toBeCloseTo(324);
  });
  it("représente le chemin apparent inverse comme une convention distincte", () => {
    const { segments } = angleSegments(0, 1.9, 0, -36);
    expect(segments).toHaveLength(1);
    expect(segments[0].start.angle).toBe(360);
    expect(segments[0].end.angle).toBe(324);
  });
  it("coupe les déplacements inverses qui passent par zéro", () => {
    const { segments } = angleSegments(0, 1, 10, -26);
    expect(segments).toHaveLength(2);
    expect(segments[0].end.angle).toBeCloseTo(0);
    expect(segments[1].start.angle).toBeCloseTo(360);
    expect(segments[1].end.angle).toBeCloseTo(334);
  });
  it("garde les vrais angles en recadrant la fenêtre", () => {
    const { segments } = angleSegments(0, 2, 0, 720, 0.5, 1.5);
    expect(segments[0].start).toEqual({ time: 0.5, angle: 180 });
    expect(segments[1].end).toEqual({ time: 1.5, angle: 180 });
  });
  it("ne dessine pas une fausse courbe sous-échantillonnée pour 10 000 tours", () => {
    expect(angleSegments(0, 10, 0, 3600000)).toEqual({
      segments: [],
      dense: true,
    });
  });
  it("représente un angle constant et ignore une fenêtre vide", () => {
    expect(angleSegments(0, 1, 0, 0).segments[0].end.angle).toBe(0);
    expect(angleSegments(0, 1, 0, 360, 2, 3).segments).toHaveLength(0);
  });
});
