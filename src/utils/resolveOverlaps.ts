import { LayoutBlock } from "@/types/layout";
import { SeedRandom } from "./seed-random";

/**
 * Detecta si dos bloques se solapan
 */
export function boxesOverlap(blockA: LayoutBlock, blockB: LayoutBlock): boolean {
  // Calcular los bordes de cada bloque
  const aLeft = blockA.x;
  const aRight = blockA.x + blockA.w;
  const aTop = blockA.y;
  const aBottom = blockA.y + blockA.h;

  const bLeft = blockB.x;
  const bRight = blockB.x + blockB.w;
  const bTop = blockB.y;
  const bBottom = blockB.y + blockB.h;

  // Verificar si hay solapamiento
  return !(
    aRight <= bLeft ||
    aLeft >= bRight ||
    aBottom <= bTop ||
    aTop >= bBottom
  );
}

/**
 * Detecta si hay algún solapamiento entre bloques
 */
function anyOverlap(blocks: LayoutBlock[]): boolean {
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      if (boxesOverlap(blocks[i], blocks[j])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Resuelve solapamientos entre bloques moviéndolos con jitter determinístico
 */
export function resolveOverlaps(
  blocks: LayoutBlock[],
  rng: SeedRandom,
  width: number,
  height: number,
  padding: number = 0.5,
  maxIterations: number = 10
): LayoutBlock[] {
  let adjustedBlocks = blocks.map((block) => ({ ...block }));
  let iterations = 0;

  while (iterations < maxIterations) {
    let hasOverlap = false;

    for (let i = 0; i < adjustedBlocks.length; i++) {
      for (let j = i + 1; j < adjustedBlocks.length; j++) {
        if (boxesOverlap(adjustedBlocks[i], adjustedBlocks[j])) {
          hasOverlap = true;

          const blockA = adjustedBlocks[i];
          const blockB = adjustedBlocks[j];

          // Calcular centro de cada bloque
          const centerAX = blockA.x + blockA.w / 2;
          const centerAY = blockA.y + blockA.h / 2;
          const centerBX = blockB.x + blockB.w / 2;
          const centerBY = blockB.y + blockB.h / 2;

          // Calcular vector de separación
          const dx = centerBX - centerAX;
          const dy = centerBY - centerAY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Si están en el mismo punto, usar ángulo aleatorio
          let separationX = 0;
          let separationY = 0;

          if (distance < 0.001) {
            // Caso especial: bloques superpuestos en el mismo punto
            const angle = rng.nextFloat(0, Math.PI * 2);
            separationX = Math.cos(angle);
            separationY = Math.sin(angle);
          } else {
            separationX = dx / distance;
            separationY = dy / distance;
          }

          // Calcular jitter determinístico
          const jitterX = (rng.next() - 0.5) * 3;
          const jitterY = (rng.next() - 0.5) * 3;

          // Mover bloque A hacia la izquierda/arriba
          const moveAmountA = padding + Math.abs(jitterX);
          blockA.x -= separationX * moveAmountA;
          blockA.y -= separationY * moveAmountA;

          // Mover bloque B hacia la derecha/abajo
          const moveAmountB = padding + Math.abs(jitterY);
          blockB.x += separationX * moveAmountB;
          blockB.y += separationY * moveAmountB;

          // Asegurar que los bloques no se salgan del canvas
          blockA.x = Math.max(0, Math.min(blockA.x, width - blockA.w));
          blockA.y = Math.max(0, Math.min(blockA.y, height - blockA.h));
          blockB.x = Math.max(0, Math.min(blockB.x, width - blockB.w));
          blockB.y = Math.max(0, Math.min(blockB.y, height - blockB.h));
        }
      }
    }

    if (!hasOverlap) {
      break;
    }

    iterations++;
  }

  return adjustedBlocks;
}

