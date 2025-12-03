/**
 * Interfaz para un bounding box
 */
export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calcula el bounding box de un polígono Voronoi
 */
export function computeBoundingBox(
  polygon: [number, number][] | null
): BoundingBox | null {
  if (!polygon || polygon.length === 0) {
    return null;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const point of polygon) {
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
    minY = Math.min(minY, point[1]);
    maxY = Math.max(maxY, point[1]);
  }

  return { minX, maxX, minY, maxY };
}

/**
 * Calcula el área de un bounding box
 */
export function computeAreaFromBox(box: BoundingBox): number {
  const width = box.maxX - box.minX;
  const height = box.maxY - box.minY;
  return width * height;
}

/**
 * Asegura que un bounding box tenga un área mínima y dimensiones mínimas
 */
export function enforceMinArea(
  box: BoundingBox,
  minArea: number,
  minWidth: number = 1,
  minHeight: number = 1
): BoundingBox {
  let { minX, maxX, minY, maxY } = box;

  const currentWidth = maxX - minX;
  const currentHeight = maxY - minY;
  const currentArea = currentWidth * currentHeight;

  // Si el área es menor que el mínimo o las dimensiones son muy pequeñas
  if (currentArea < minArea || currentWidth < minWidth || currentHeight < minHeight) {
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calcular nuevas dimensiones
    let newWidth = Math.max(currentWidth, minWidth);
    let newHeight = Math.max(currentHeight, minHeight);

    // Si el área es menor que minArea, expandir proporcionalmente
    if (currentArea < minArea) {
      const ratio = Math.sqrt(minArea / currentArea);
      newWidth = Math.max(newWidth, currentWidth * ratio);
      newHeight = Math.max(newHeight, currentHeight * ratio);
    }

    // Asegurar que el área final sea al menos minArea
    if (newWidth * newHeight < minArea) {
      const areaRatio = Math.sqrt(minArea / (newWidth * newHeight));
      newWidth *= areaRatio;
      newHeight *= areaRatio;
    }

    // Expandir desde el centro
    minX = centerX - newWidth / 2;
    maxX = centerX + newWidth / 2;
    minY = centerY - newHeight / 2;
    maxY = centerY + newHeight / 2;
  }

  return { minX, maxX, minY, maxY };
}

/**
 * Normaliza un bounding box para asegurar que esté dentro de los límites del canvas
 */
export function normalizeBox(
  box: BoundingBox,
  width: number,
  height: number
): BoundingBox {
  let { minX, maxX, minY, maxY } = box;

  // Asegurar que esté dentro de los límites
  minX = Math.max(0, Math.min(minX, width));
  maxX = Math.max(0, Math.min(maxX, width));
  minY = Math.max(0, Math.min(minY, height));
  maxY = Math.max(0, Math.min(maxY, height));

  // Si el box se invirtió por estar fuera de límites, corregir
  if (minX >= maxX) {
    const centerX = width / 2;
    minX = Math.max(0, centerX - 1);
    maxX = Math.min(width, centerX + 1);
  }

  if (minY >= maxY) {
    const centerY = height / 2;
    minY = Math.max(0, centerY - 1);
    maxY = Math.min(height, centerY + 1);
  }

  return { minX, maxX, minY, maxY };
}

