import { LayoutBlock } from "@/types/layout";

/**
 * Valida que las particiones no se solapen usando un grid
 * Si encuentra solapamientos, los corrige ajustando las particiones
 */
export function validateAndFixPartitions(
  blocks: LayoutBlock[],
  width: number,
  height: number
): LayoutBlock[] {
  // Crear grid para rastrear qué celdas están ocupadas
  const grid: (number | null)[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = null;
    }
  }

  // Verificar y corregir solapamientos
  const correctedBlocks: LayoutBlock[] = [];
  
  for (const block of blocks) {
    const correctedBlock = { ...block };
    
    // Verificar si hay solapamientos con bloques ya procesados
    let hasOverlap = false;
    for (let y = Math.floor(correctedBlock.y); y < Math.floor(correctedBlock.y + correctedBlock.h); y++) {
      for (let x = Math.floor(correctedBlock.x); x < Math.floor(correctedBlock.x + correctedBlock.w); x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          if (grid[y][x] !== null) {
            hasOverlap = true;
            break;
          }
        }
      }
      if (hasOverlap) break;
    }

    // Si hay solapamiento, ajustar el bloque para que no se solape
    if (hasOverlap) {
      // Encontrar el siguiente espacio disponible
      let found = false;
      for (let startY = 0; startY <= height - correctedBlock.h && !found; startY++) {
        for (let startX = 0; startX <= width - correctedBlock.w && !found; startX++) {
          // Verificar si este espacio está libre
          let isFree = true;
          for (let y = startY; y < startY + correctedBlock.h && isFree; y++) {
            for (let x = startX; x < startX + correctedBlock.w && isFree; x++) {
              if (y >= 0 && y < height && x >= 0 && x < width) {
                if (grid[y][x] !== null) {
                  isFree = false;
                }
              } else {
                isFree = false;
              }
            }
          }
          
          if (isFree) {
            correctedBlock.x = startX;
            correctedBlock.y = startY;
            found = true;
          }
        }
      }
    }

    // Marcar las celdas como ocupadas por este bloque
    for (let y = Math.floor(correctedBlock.y); y < Math.min(Math.floor(correctedBlock.y + correctedBlock.h), height); y++) {
      for (let x = Math.floor(correctedBlock.x); x < Math.min(Math.floor(correctedBlock.x + correctedBlock.w), width); x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          grid[y][x] = correctedBlocks.length;
        }
      }
    }

    // Asegurar límites
    correctedBlock.x = Math.max(0, Math.min(Math.floor(correctedBlock.x), width - 1));
    correctedBlock.y = Math.max(0, Math.min(Math.floor(correctedBlock.y), height - 1));
    correctedBlock.w = Math.max(1, Math.min(Math.ceil(correctedBlock.w), width - correctedBlock.x));
    correctedBlock.h = Math.max(1, Math.min(Math.ceil(correctedBlock.h), height - correctedBlock.y));

    correctedBlocks.push(correctedBlock);
  }

  return correctedBlocks;
}

/**
 * Verifica si hay solapamientos entre bloques
 */
export function hasOverlaps(blocks: LayoutBlock[]): boolean {
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i];
      const b = blocks[j];
      
      const aRight = a.x + a.w;
      const aBottom = a.y + a.h;
      const bRight = b.x + b.w;
      const bBottom = b.y + b.h;

      if (!(aRight <= b.x || a.x >= bRight || aBottom <= b.y || a.y >= bBottom)) {
        return true;
      }
    }
  }
  return false;
}

