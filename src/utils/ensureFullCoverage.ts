import { LayoutBlock } from "@/types/layout";
import { SeedRandom } from "./seed-random";
import { boxesOverlap } from "./resolveOverlaps";

/**
 * Detecta si dos bloques son adyacentes (comparten un borde)
 */
function areAdjacent(blockA: LayoutBlock, blockB: LayoutBlock): boolean {
  const aRight = blockA.x + blockA.w;
  const aBottom = blockA.y + blockA.h;
  const bRight = blockB.x + blockB.w;
  const bBottom = blockB.y + blockB.h;

  // Misma columna, bloques verticalmente adyacentes
  const sameColumn =
    (blockA.x < bRight && aRight > blockB.x) &&
    (Math.abs(blockA.y - bBottom) < 0.1 || Math.abs(aBottom - blockB.y) < 0.1);

  // Misma fila, bloques horizontalmente adyacentes
  const sameRow =
    (blockA.y < bBottom && aBottom > blockB.y) &&
    (Math.abs(blockA.x - bRight) < 0.1 || Math.abs(aRight - blockB.x) < 0.1);

  return sameColumn || sameRow;
}

/**
 * Elimina solapamientos ajustando tamaños de forma precisa
 */
function eliminateOverlaps(
  blocks: LayoutBlock[],
  width: number,
  height: number,
  rng: SeedRandom
): LayoutBlock[] {
  const adjustedBlocks = blocks.map((block) => ({ ...block }));
  let hasOverlap = true;
  let iterations = 0;

  while (hasOverlap && iterations < 50) {
    hasOverlap = false;

    for (let i = 0; i < adjustedBlocks.length; i++) {
      for (let j = i + 1; j < adjustedBlocks.length; j++) {
        const blockA = adjustedBlocks[i];
        const blockB = adjustedBlocks[j];

        if (boxesOverlap(blockA, blockB)) {
          hasOverlap = true;

          // Calcular intersección exacta
          const overlapLeft = Math.max(blockA.x, blockB.x);
          const overlapRight = Math.min(blockA.x + blockA.w, blockB.x + blockB.w);
          const overlapTop = Math.max(blockA.y, blockB.y);
          const overlapBottom = Math.min(blockA.y + blockA.h, blockB.y + blockB.h);

          const overlapW = Math.max(0, overlapRight - overlapLeft);
          const overlapH = Math.max(0, overlapBottom - overlapTop);

          // Calcular posiciones relativas
          const aLeft = blockA.x;
          const aRight = blockA.x + blockA.w;
          const aTop = blockA.y;
          const aBottom = blockA.y + blockA.h;

          const bLeft = blockB.x;
          const bRight = blockB.x + blockB.w;
          const bTop = blockB.y;
          const bBottom = blockB.y + blockB.h;

          // Determinar cómo resolver el solapamiento
          // Prioridad: reducir el bloque que menos "pierde" área

          // Caso 1: blockA está a la izquierda de blockB (solapamiento horizontal)
          if (aRight > bLeft && aLeft < bLeft) {
            // Reducir blockA desde la derecha
            blockA.w = Math.max(1, bLeft - blockA.x);
          }
          // Caso 2: blockB está a la izquierda de blockA (solapamiento horizontal)
          else if (bRight > aLeft && bLeft < aLeft) {
            // Reducir blockB desde la derecha
            blockB.w = Math.max(1, aLeft - blockB.x);
          }
          // Caso 3: blockA está arriba de blockB (solapamiento vertical)
          else if (aBottom > bTop && aTop < bTop) {
            // Reducir blockA desde abajo
            blockA.h = Math.max(1, bTop - blockA.y);
          }
          // Caso 4: blockB está arriba de blockA (solapamiento vertical)
          else if (bBottom > aTop && bTop < aTop) {
            // Reducir blockB desde abajo
            blockB.h = Math.max(1, aTop - blockB.y);
          }
          // Caso 5: Solapamiento complejo (uno contiene parcialmente al otro)
          else {
            // Resolver según qué bloque tiene más área en la intersección
            const areaA = blockA.w * blockA.h;
            const areaB = blockB.w * blockB.h;
            const intersectionArea = overlapW * overlapH;

            // Calcular qué porcentaje de cada bloque está en la intersección
            const percentA = intersectionArea / areaA;
            const percentB = intersectionArea / areaB;

            // Reducir el bloque que tiene menor porcentaje de área en la intersección
            if (percentA < percentB || (percentA === percentB && areaA < areaB)) {
              // Reducir blockA: reducir desde el lado más cercano a blockB
              if (overlapW > overlapH) {
                // Solapamiento más horizontal
                if (blockA.x < blockB.x) {
                  blockA.w = Math.max(1, blockB.x - blockA.x);
                } else {
                  blockA.w = Math.max(1, blockA.w - (aRight - blockB.x));
                  blockA.x = blockB.x + blockB.w;
                }
              } else {
                // Solapamiento más vertical
                if (blockA.y < blockB.y) {
                  blockA.h = Math.max(1, blockB.y - blockA.y);
                } else {
                  blockA.h = Math.max(1, blockA.h - (aBottom - blockB.y));
                  blockA.y = blockB.y + blockB.h;
                }
              }
            } else {
              // Reducir blockB
              if (overlapW > overlapH) {
                if (blockB.x < blockA.x) {
                  blockB.w = Math.max(1, blockA.x - blockB.x);
                } else {
                  blockB.w = Math.max(1, blockB.w - (bRight - blockA.x));
                  blockB.x = blockA.x + blockA.w;
                }
              } else {
                if (blockB.y < blockA.y) {
                  blockB.h = Math.max(1, blockA.y - blockB.y);
                } else {
                  blockB.h = Math.max(1, blockB.h - (bBottom - blockA.y));
                  blockB.y = blockA.y + blockA.h;
                }
              }
            }
          }

          // Asegurar límites válidos
          blockA.x = Math.max(0, Math.min(blockA.x, width - 1));
          blockA.y = Math.max(0, Math.min(blockA.y, height - 1));
          blockA.w = Math.max(1, Math.min(blockA.w, width - blockA.x));
          blockA.h = Math.max(1, Math.min(blockA.h, height - blockA.y));

          blockB.x = Math.max(0, Math.min(blockB.x, width - 1));
          blockB.y = Math.max(0, Math.min(blockB.y, height - 1));
          blockB.w = Math.max(1, Math.min(blockB.w, width - blockB.x));
          blockB.h = Math.max(1, Math.min(blockB.h, height - blockB.y));
        }
      }
    }

    iterations++;
  }

  return adjustedBlocks;
}

/**
 * Detecta espacios vacíos en el canvas y los rellena expandiendo bloques adyacentes
 */
function fillEmptySpaces(
  blocks: LayoutBlock[],
  width: number,
  height: number,
  rng: SeedRandom
): LayoutBlock[] {
  const expandedBlocks = blocks.map((block) => ({ ...block }));
  let iterations = 0;
  const maxIterations = 100;

  while (iterations < maxIterations) {
    // Crear grid de ocupación
    const grid: boolean[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = false;
      }
    }

    // Marcar todas las celdas ocupadas
    expandedBlocks.forEach((block) => {
      for (let y = Math.max(0, Math.floor(block.y)); y < Math.min(Math.floor(block.y + block.h), height); y++) {
        for (let x = Math.max(0, Math.floor(block.x)); x < Math.min(Math.floor(block.x + block.w), width); x++) {
          grid[y][x] = true;
        }
      }
    });

    // Buscar espacios vacíos y asignarlos al bloque más cercano
    let foundEmpty = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!grid[y][x]) {
          foundEmpty = true;

          // Encontrar el bloque más cercano a este espacio vacío
          let closestBlock: LayoutBlock | null = null;
          let minDistance = Infinity;

          for (const block of expandedBlocks) {
            const blockRight = block.x + block.w;
            const blockBottom = block.y + block.h;

            // Calcular distancia al bloque (si está adyacente, distancia = 0)
            let distance = Infinity;

            // Verificar si es adyacente horizontalmente
            if (
              y >= block.y &&
              y < blockBottom &&
              (Math.abs(x - block.x) <= 1 || Math.abs(x - blockRight) <= 1)
            ) {
              distance = Math.min(
                Math.abs(x - block.x),
                Math.abs(x - blockRight)
              );
            }
            // Verificar si es adyacente verticalmente
            else if (
              x >= block.x &&
              x < blockRight &&
              (Math.abs(y - block.y) <= 1 || Math.abs(y - blockBottom) <= 1)
            ) {
              distance = Math.min(
                Math.abs(y - block.y),
                Math.abs(y - blockBottom)
              );
            }
            // Si no es adyacente, calcular distancia euclidiana
            else {
              const dx = x < block.x ? block.x - x : x >= blockRight ? x - blockRight + 1 : 0;
              const dy = y < block.y ? block.y - y : y >= blockBottom ? y - blockBottom + 1 : 0;
              distance = Math.sqrt(dx * dx + dy * dy);
            }

            if (distance < minDistance) {
              minDistance = distance;
              closestBlock = block;
            }
          }

          // Expandir el bloque más cercano para cubrir este espacio
          if (closestBlock) {
            const block = closestBlock;
            const blockRight = block.x + block.w;
            const blockBottom = block.y + block.h;

            // Expandir hacia la derecha
            if (x >= blockRight && y >= block.y && y < blockBottom) {
              block.w = Math.max(block.w, x + 1 - block.x);
            }
            // Expandir hacia la izquierda
            else if (x < block.x && y >= block.y && y < blockBottom) {
              const oldW = block.w;
              block.w = blockRight - x;
              block.x = x;
            }
            // Expandir hacia abajo
            else if (y >= blockBottom && x >= block.x && x < blockRight) {
              block.h = Math.max(block.h, y + 1 - block.y);
            }
            // Expandir hacia arriba
            else if (y < block.y && x >= block.x && x < blockRight) {
              const oldH = block.h;
              block.h = blockBottom - y;
              block.y = y;
            }
            // Expandir en esquina (expandir primero horizontalmente, luego verticalmente)
            else if (x >= blockRight || x < block.x) {
              if (y >= blockBottom || y < block.y) {
                // Primero expandir horizontalmente
                if (x >= blockRight) {
                  block.w = Math.max(block.w, x + 1 - block.x);
                } else {
                  block.w = blockRight - x;
                  block.x = x;
                }
                // Luego expandir verticalmente si aún hay espacio
                if (y >= block.y + block.h) {
                  block.h = Math.max(block.h, y + 1 - block.y);
                } else if (y < block.y) {
                  block.h = block.y + block.h - y;
                  block.y = y;
                }
              }
            }

            // Asegurar límites
            block.x = Math.max(0, Math.floor(block.x));
            block.y = Math.max(0, Math.floor(block.y));
            block.w = Math.min(Math.ceil(block.w), width - block.x);
            block.h = Math.min(Math.ceil(block.h), height - block.y);
          }
        }
      }
    }

    // Si no se encontraron espacios vacíos, terminamos
    if (!foundEmpty) {
      break;
    }

    iterations++;
  }

  return expandedBlocks;
}

/**
 * Asegura que el layout cubra todo el espacio sin solapamientos
 */
export function ensureFullCoverage(
  blocks: LayoutBlock[],
  width: number,
  height: number,
  rng: SeedRandom
): LayoutBlock[] {
  // Paso 1: Eliminar todos los solapamientos
  let adjustedBlocks = eliminateOverlaps(blocks, width, height, rng);

  // Paso 2: Rellenar espacios vacíos expandiendo bloques
  adjustedBlocks = fillEmptySpaces(adjustedBlocks, width, height, rng);

  // Paso 3: Eliminar solapamientos que puedan haberse creado durante la expansión
  adjustedBlocks = eliminateOverlaps(adjustedBlocks, width, height, rng);

  // Paso 4: Rellenar espacios vacíos una vez más
  adjustedBlocks = fillEmptySpaces(adjustedBlocks, width, height, rng);

  return adjustedBlocks;
}

