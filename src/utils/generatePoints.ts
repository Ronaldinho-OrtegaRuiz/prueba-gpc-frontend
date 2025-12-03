import { SlotType } from "@/types/gpc";
import { SeedRandom } from "./seed-random";
import {
  enforceMinDistance,
  biasPointToArea,
  enforceSoftBounds,
} from "./spatialRules";

/**
 * Determina el sesgo espacial para un tipo de slot
 */
function getSlotBias(slotId: SlotType): "top" | "bottom" | "center" | null {
  switch (slotId) {
    case "hero":
    case "navbar":
      return "top";
    case "footer":
    case "cta":
      return "bottom";
    default:
      return null;
  }
}

/**
 * Genera puntos para el diagrama de Voronoi con reglas espaciales aplicadas
 */
export function generatePoints(
  slots: SlotType[],
  width: number,
  height: number,
  rng: SeedRandom
): [number, number][] {
  // Generar un punto inicial para cada slot
  const points: [number, number][] = [];

  for (let i = 0; i < slots.length; i++) {
    // Generar posición inicial aleatoria pero determinística
    let x = rng.nextFloat(0, width);
    let y = rng.nextFloat(0, height);

    const point: [number, number] = [x, y];

    // Aplicar sesgo según el tipo de slot
    const bias = getSlotBias(slots[i]);
    if (bias) {
      const biasedPoint = biasPointToArea(
        point,
        bias,
        width,
        height,
        rng,
        0.4
      );
      point[0] = biasedPoint[0];
      point[1] = biasedPoint[1];
    }

    // Aplicar límites suaves (evitar extremos del canvas)
    const softBoundsPoint = enforceSoftBounds(point, {
      minX: 0,
      maxX: width,
      minY: 0,
      maxY: height,
      padding: 0.5,
    });
    point[0] = softBoundsPoint[0];
    point[1] = softBoundsPoint[1];

    points.push(point);
  }

  // Si hay pocos puntos, añadir algunos adicionales para crear más variación
  if (points.length < 5) {
    const additionalPoints = 5 - points.length;
    for (let i = 0; i < additionalPoints; i++) {
      const x = rng.nextFloat(0, width);
      const y = rng.nextFloat(0, height);
      const point: [number, number] = [x, y];

      const softBoundsPoint = enforceSoftBounds(point, {
        minX: 0,
        maxX: width,
        minY: 0,
        maxY: height,
        padding: 0.5,
      });

      points.push([softBoundsPoint[0], softBoundsPoint[1]]);
    }
  }

  // Aplicar regla de distancia mínima entre puntos
  const minDistance = 1.5;
  const adjustedPoints = enforceMinDistance(points, minDistance, rng, 10);

  return adjustedPoints;
}

