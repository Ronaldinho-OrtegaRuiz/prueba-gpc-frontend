import { LayoutBlock } from "@/types/layout";

/**
 * Ajusta la región del hero para que tenga área mínima grande y preferencia horizontal
 */
export function adjustHeroRegion(
  box: LayoutBlock,
  width: number,
  height: number
): LayoutBlock {
  const minArea = 8;
  const currentArea = box.w * box.h;

  if (currentArea < minArea) {
    // Expandir para alcanzar el área mínima
    const ratio = Math.sqrt(minArea / currentArea);
    box.w = Math.max(box.w * ratio, 2);
    box.h = Math.max(box.h * ratio, 2);

    // Ajustar si se sale de los límites
    if (box.x + box.w > width) {
      box.x = Math.max(0, width - box.w);
    }
    if (box.y + box.h > height) {
      box.y = Math.max(0, height - box.h);
    }
  }

  // Preferir ancho mayor que alto (aspect ratio > 1.2)
  const aspectRatio = box.w / box.h;
  if (aspectRatio < 1.2 && box.h > 1) {
    // Intentar expandir horizontalmente
    const desiredWidth = box.h * 1.2;
    if (box.x + desiredWidth <= width) {
      box.w = desiredWidth;
    } else if (box.x > 0) {
      // Mover hacia la izquierda si es posible
      const maxWidth = width - box.x;
      if (maxWidth > box.w) {
        box.w = maxWidth;
      }
    }
  }

  return box;
}

/**
 * Ajusta la forma del header/navbar para que sea horizontal
 */
export function adjustHeaderShape(
  box: LayoutBlock,
  width: number
): LayoutBlock {
  // Para navbar: asegurar que w/h >= 2 (horizontal)
  const minRatio = 2;
  const currentRatio = box.w / box.h;

  if (currentRatio < minRatio && box.h > 0.5) {
    // Expandir horizontalmente
    const desiredWidth = box.h * minRatio;
    if (box.x + desiredWidth <= width) {
      box.w = desiredWidth;
    } else {
      // Ajustar al ancho disponible
      box.w = Math.max(box.w, width - box.x);
    }
  }

  return box;
}

/**
 * Ajusta la forma de las tarjetas para que sean más cuadradas
 */
export function adjustCardShape(box: LayoutBlock): LayoutBlock {
  const minRatio = 0.7;
  const maxRatio = 1.4;
  const currentRatio = box.w / box.h;

  if (box.h > 0 && (currentRatio < minRatio || currentRatio > maxRatio)) {
    // Hacer más cuadrado
    if (currentRatio < minRatio) {
      // Demasiado vertical, expandir ancho
      box.w = box.h * minRatio;
    } else if (currentRatio > maxRatio) {
      // Demasiado horizontal, expandir alto
      box.h = box.w / maxRatio;
    }
  }

  return box;
}

/**
 * Ajusta la posición del footer para que esté en la parte inferior
 */
export function adjustFooterPosition(
  box: LayoutBlock,
  height: number
): LayoutBlock {
  const bottomThreshold = height * 0.7;

  // Si el footer está muy arriba, moverlo hacia abajo
  if (box.y < bottomThreshold) {
    box.y = Math.max(bottomThreshold, height - box.h - 1);
  }

  // Asegurar que no se salga del canvas
  if (box.y + box.h > height) {
    box.y = Math.max(0, height - box.h);
  }

  return box;
}

/**
 * Determina si un slot es una tarjeta
 */
function isCardSlot(slotId: string): boolean {
  return (
    slotId.includes("_card") ||
    slotId === "recipe_card" ||
    slotId === "concept_card" ||
    slotId === "artwork_showcase"
  );
}

/**
 * Aplica todas las heurísticas visuales según el tipo de slot
 */
export function applyHeuristics(
  blocks: LayoutBlock[],
  width: number,
  height: number
): LayoutBlock[] {
  return blocks.map((block) => {
    let adjusted = { ...block };

    switch (block.id) {
      case "hero":
        adjusted = adjustHeroRegion(adjusted, width, height);
        break;

      case "navbar":
        adjusted = adjustHeaderShape(adjusted, width);
        break;

      case "footer":
        adjusted = adjustFooterPosition(adjusted, height);
        break;

      default:
        // Aplicar ajuste de tarjeta si corresponde
        if (isCardSlot(block.id)) {
          adjusted = adjustCardShape(adjusted);
        }
        break;
    }

    return adjusted;
  });
}

