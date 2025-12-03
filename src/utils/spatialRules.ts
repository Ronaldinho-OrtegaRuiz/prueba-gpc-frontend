import { SeedRandom } from "./seed-random";

/**
 * Calcula la distancia euclidiana entre dos puntos
 */
function distance(
  p1: [number, number],
  p2: [number, number]
): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Aplica una distancia mínima entre todos los puntos
 * Mueve puntos que estén demasiado cerca usando jitter determinístico
 */
export function enforceMinDistance(
  points: [number, number][],
  minDistance: number,
  rng: SeedRandom,
  maxIterations: number = 10
): [number, number][] {
  const adjustedPoints = [...points];
  let hasConflict = true;
  let iterations = 0;

  while (hasConflict && iterations < maxIterations) {
    hasConflict = false;

    for (let i = 0; i < adjustedPoints.length; i++) {
      for (let j = i + 1; j < adjustedPoints.length; j++) {
        const dist = distance(adjustedPoints[i], adjustedPoints[j]);

        if (dist < minDistance) {
          hasConflict = true;

          // Calcular vector de separación
          const dx = adjustedPoints[j][0] - adjustedPoints[i][0];
          const dy = adjustedPoints[j][1] - adjustedPoints[i][1];
          const angle = Math.atan2(dy, dx);

          // Añadir jitter determinístico
          const jitterAngle = rng.nextFloat(0, Math.PI * 2);
          const jitterMagnitude = rng.nextFloat(0.3, 0.7) * (minDistance - dist);

          // Mover ambos puntos en direcciones opuestas
          adjustedPoints[i][0] -= Math.cos(jitterAngle) * jitterMagnitude;
          adjustedPoints[i][1] -= Math.sin(jitterAngle) * jitterMagnitude;
          adjustedPoints[j][0] += Math.cos(jitterAngle) * jitterMagnitude;
          adjustedPoints[j][1] += Math.sin(jitterAngle) * jitterMagnitude;
        }
      }
    }

    iterations++;
  }

  return adjustedPoints;
}

/**
 * Sesga un punto hacia un área específica del canvas
 */
export function biasPointToArea(
  point: [number, number],
  bias: "top" | "bottom" | "center" | "left" | "right",
  width: number,
  height: number,
  rng: SeedRandom,
  biasStrength: number = 0.4
): [number, number] {
  const [x, y] = point;
  let newX = x;
  let newY = y;

  switch (bias) {
    case "top":
      // Sesgar hacia arriba (y cerca de 0)
      newY = y * (1 - biasStrength) + (height * 0.1) * biasStrength;
      // Añadir variación determinística
      newY += rng.nextFloat(-0.5, 0.5);
      break;

    case "bottom":
      // Sesgar hacia abajo (y cerca de height)
      newY = y * (1 - biasStrength) + (height * 0.9) * biasStrength;
      newY += rng.nextFloat(-0.5, 0.5);
      break;

    case "center":
      // Sesgar hacia el centro
      newX = x * (1 - biasStrength) + (width * 0.5) * biasStrength;
      newY = y * (1 - biasStrength) + (height * 0.5) * biasStrength;
      newX += rng.nextFloat(-0.5, 0.5);
      newY += rng.nextFloat(-0.5, 0.5);
      break;

    case "left":
      // Sesgar hacia la izquierda (x cerca de 0)
      newX = x * (1 - biasStrength) + (width * 0.1) * biasStrength;
      newX += rng.nextFloat(-0.5, 0.5);
      break;

    case "right":
      // Sesgar hacia la derecha (x cerca de width)
      newX = x * (1 - biasStrength) + (width * 0.9) * biasStrength;
      newX += rng.nextFloat(-0.5, 0.5);
      break;
  }

  // Asegurar que el punto siga dentro de los límites
  newX = Math.max(0, Math.min(width, newX));
  newY = Math.max(0, Math.min(height, newY));

  return [newX, newY];
}

/**
 * Asegura que un punto no esté demasiado cerca de los bordes del canvas
 */
export function enforceSoftBounds(
  point: [number, number],
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    padding: number;
  }
): [number, number] {
  let [x, y] = point;

  // Ajustar si está demasiado cerca del borde izquierdo
  if (x < bounds.minX + bounds.padding) {
    x = bounds.minX + bounds.padding + (bounds.padding * 0.5);
  }

  // Ajustar si está demasiado cerca del borde derecho
  if (x > bounds.maxX - bounds.padding) {
    x = bounds.maxX - bounds.padding - (bounds.padding * 0.5);
  }

  // Ajustar si está demasiado cerca del borde superior
  if (y < bounds.minY + bounds.padding) {
    y = bounds.minY + bounds.padding + (bounds.padding * 0.5);
  }

  // Ajustar si está demasiado cerca del borde inferior
  if (y > bounds.maxY - bounds.padding) {
    y = bounds.maxY - bounds.padding - (bounds.padding * 0.5);
  }

  return [x, y];
}

