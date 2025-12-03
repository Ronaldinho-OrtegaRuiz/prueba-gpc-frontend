import { SeedRandom } from "./seed-random";

/**
 * Representa un rectángulo en el espacio
 */
interface Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Nodo del árbol BSP
 */
interface BSPNode {
  rect: Rectangle;
  left: BSPNode | null;
  right: BSPNode | null;
  isLeaf: boolean;
}

/**
 * Genera una partición del espacio usando Binary Space Partitioning (BSP)
 * Garantiza cobertura completa sin solapamientos
 */
export function generateBSPPartition(
  width: number,
  height: number,
  numPartitions: number,
  rng: SeedRandom
): Rectangle[] {
  // Crear el rectángulo inicial que cubre todo el canvas
  const root: BSPNode = {
    rect: { x: 0, y: 0, w: width, h: height },
    left: null,
    right: null,
    isLeaf: true,
  };

  // Dividir recursivamente hasta tener suficientes particiones
  const leaves: BSPNode[] = [root];
  let currentLeaves = leaves.length;

  while (currentLeaves < numPartitions) {
    // Ordenar hojas por área (más grandes primero)
    leaves.sort((a, b) => {
      const areaA = a.rect.w * a.rect.h;
      const areaB = b.rect.w * b.rect.h;
      return areaB - areaA;
    });

    // Buscar el nodo hoja más grande que sea divisible
    let leafToSplit: BSPNode | null = null;
    let leafIndex = -1;

    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      // Verificar que sea divisible (al menos 2 unidades en ambas dimensiones)
      if (leaf.rect.w >= 2 && leaf.rect.h >= 2) {
        leafToSplit = leaf;
        leafIndex = i;
        break;
      }
    }

    // Si no hay nodos divisibles, terminar
    if (!leafToSplit || leafIndex === -1) {
      break;
    }

    // Dividir el nodo
    const split = splitNode(leafToSplit, rng);

    // Reemplazar el nodo hoja con el nodo dividido
    leaves.splice(leafIndex, 1);
    if (split.left.isLeaf) leaves.push(split.left);
    if (split.right.isLeaf) leaves.push(split.right);

    currentLeaves = leaves.length;
  }

  // Retornar los rectángulos de todas las hojas
  return leaves.map((leaf) => leaf.rect);
}

/**
 * Divide un nodo BSP en dos sub-nodos
 */
function splitNode(node: BSPNode, rng: SeedRandom): BSPNode {
  const { rect } = node;

  // Decidir dirección de división basado en la semilla
  // Si es más ancho que alto, dividir verticalmente (más sentido)
  // Si es más alto que ancho, dividir horizontalmente (más sentido)
  // Si es cuadrado, decidir aleatoriamente pero determinísticamente
  let splitHorizontally: boolean;

  const aspectRatio = rect.w / rect.h;

  if (aspectRatio > 1.2) {
    // Rectángulo horizontal → dividir verticalmente
    splitHorizontally = false;
  } else if (aspectRatio < 0.8) {
    // Rectángulo vertical → dividir horizontalmente
    splitHorizontally = true;
  } else {
    // Casi cuadrado → decidir determinísticamente
    splitHorizontally = rng.next() < 0.5;
  }

  let leftRect: Rectangle;
  let rightRect: Rectangle;

  if (splitHorizontally) {
    // Dividir horizontalmente (crear dos rectángulos apilados)
    // Elegir punto de división determinísticamente (entre 30% y 70% del alto)
    const minSplit = 0.3;
    const maxSplit = 0.7;
    const splitRatio = minSplit + rng.next() * (maxSplit - minSplit);
    const splitY = rect.y + rect.h * splitRatio;

    // Asegurar tamaño mínimo de 1 unidad para cada parte
    const actualSplitY = Math.max(
      rect.y + 1,
      Math.min(rect.y + rect.h - 1, splitY)
    );

    leftRect = {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: actualSplitY - rect.y,
    };

    rightRect = {
      x: rect.x,
      y: actualSplitY,
      w: rect.w,
      h: rect.y + rect.h - actualSplitY,
    };
    
    // Asegurar que los rectángulos sean exactamente disjuntos
    // El derecho debe empezar donde termina el izquierdo exactamente
    if (Math.abs(actualSplitY - (rect.y + leftRect.h)) > 0.0001) {
      leftRect.h = actualSplitY - rect.y;
      rightRect.y = actualSplitY;
      rightRect.h = rect.y + rect.h - actualSplitY;
    }
  } else {
    // Dividir verticalmente (crear dos rectángulos lado a lado)
    // Elegir punto de división determinísticamente (entre 30% y 70% del ancho)
    const minSplit = 0.3;
    const maxSplit = 0.7;
    const splitRatio = minSplit + rng.next() * (maxSplit - minSplit);
    const splitX = rect.x + rect.w * splitRatio;

    // Asegurar tamaño mínimo de 1 unidad para cada parte
    const actualSplitX = Math.max(
      rect.x + 1,
      Math.min(rect.x + rect.w - 1, splitX)
    );

    leftRect = {
      x: rect.x,
      y: rect.y,
      w: actualSplitX - rect.x,
      h: rect.h,
    };

    rightRect = {
      x: actualSplitX,
      y: rect.y,
      w: rect.x + rect.w - actualSplitX,
      h: rect.h,
    };
    
    // Asegurar que los rectángulos sean exactamente disjuntos
    // El derecho debe empezar donde termina el izquierdo exactamente
    if (Math.abs(actualSplitX - (rect.x + leftRect.w)) > 0.0001) {
      leftRect.w = actualSplitX - rect.x;
      rightRect.x = actualSplitX;
      rightRect.w = rect.x + rect.w - actualSplitX;
    }
  }

  return {
    rect,
    left: {
      rect: leftRect,
      left: null,
      right: null,
      isLeaf: true,
    },
    right: {
      rect: rightRect,
      left: null,
      right: null,
      isLeaf: true,
    },
    isLeaf: false,
  };
}

/**
 * Divide un rectángulo específico en N particiones usando BSP
 */
export function splitRectangle(
  rect: Rectangle,
  numPartitions: number,
  rng: SeedRandom
): Rectangle[] {
  if (numPartitions <= 1) {
    return [rect];
  }

  // Crear nodo BSP para este rectángulo
  const root: BSPNode = {
    rect,
    left: null,
    right: null,
    isLeaf: true,
  };

  const leaves: BSPNode[] = [root];
  let currentLeaves = 1;

  while (currentLeaves < numPartitions && leaves.length > 0) {
    // Ordenar por área (más grandes primero)
    leaves.sort((a, b) => {
      const areaA = a.rect.w * a.rect.h;
      const areaB = b.rect.w * b.rect.h;
      return areaB - areaA;
    });

    // Buscar el nodo más grande divisible
    let leafToSplit: BSPNode | null = null;
    let leafIndex = -1;

    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      if (leaf.rect.w >= 2 && leaf.rect.h >= 2) {
        leafToSplit = leaf;
        leafIndex = i;
        break;
      }
    }

    if (!leafToSplit || leafIndex === -1) {
      break;
    }

    const split = splitNode(leafToSplit, rng);
    leaves.splice(leafIndex, 1);
    if (split.left.isLeaf) leaves.push(split.left);
    if (split.right.isLeaf) leaves.push(split.right);

    currentLeaves = leaves.length;
  }

  return leaves.map((leaf) => leaf.rect);
}

