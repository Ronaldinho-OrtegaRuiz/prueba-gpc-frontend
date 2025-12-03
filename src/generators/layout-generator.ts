import { GPC_DATA } from "@/data/gpc-data";
import { GenerateLayoutParams, Layout, LayoutBlock } from "@/types/layout";
import { SlotType } from "@/types/gpc";
import { SeedRandom } from "@/utils/seed-random";
import { generateBSPPartition, splitRectangle } from "@/utils/bsp-partition";
import { validateAndFixPartitions } from "@/utils/validatePartitions";

/**
 * Obtiene los valores mínimos de área y dimensiones según el tipo de slot
 */
function getSlotMinRequirements(slotId: SlotType): {
  minArea: number;
  minWidth: number;
  minHeight: number;
} {
  switch (slotId) {
    case "hero":
      return { minArea: 8, minWidth: 2, minHeight: 2 };
    case "navbar":
      return { minArea: 2, minWidth: 2, minHeight: 1 };
    case "recipe_card":
    case "concept_card":
    case "artwork_showcase":
      return { minArea: 2.25, minWidth: 1.5, minHeight: 1.5 };
    default:
      return { minArea: 2, minWidth: 1, minHeight: 1 };
  }
}

/**
 * Genera un layout procedural usando Binary Space Partitioning (BSP)
 * Divide el espacio en particiones rectangulares determinísticas basadas en la semilla
 * Garantiza cobertura completa sin solapamientos ni espacios vacíos
 * Aplica validaciones y heurísticas visuales
 */
export function generateLayout(params: GenerateLayoutParams): Layout {
  const {
    seed,
    category: categoryName,
    subcategory: subcategoryName,
    width = 12,
    height = 20,
  } = params;

  // Inicializar generador de números aleatorios basado en seed
  const rng = new SeedRandom(seed);

  // Buscar la categoría y subcategoría en los datos
  const category = GPC_DATA.categories.find(
    (c) => c.name === categoryName || c.id === categoryName
  );
  const subcategory = GPC_DATA.subcategories.find(
    (s) => s.name === subcategoryName || s.id === subcategoryName
  );

  if (!category) {
    throw new Error(`Categoría "${categoryName}" no encontrada`);
  }

  if (!subcategory) {
    throw new Error(`Subcategoría "${subcategoryName}" no encontrada`);
  }

  // Obtener los slots para esta categoría
  const slots = GPC_DATA.slots[category.id] || [];

  if (slots.length === 0) {
    throw new Error(`No hay slots definidos para la categoría "${category.id}"`);
  }

  // Obtener la paleta de colores para esta subcategoría
  const palette =
    GPC_DATA.palettes[subcategory.id] || ["#cccccc", "#888888", "#444444"];

  // FASE 1: Generar particiones BSP (Binary Space Partitioning)
  // Esto garantiza cobertura completa sin solapamientos
  const numPartitions = Math.max(slots.length, 1);
  const bspRects = generateBSPPartition(width, height, numPartitions, rng);
  
  // Asegurar que tenemos al menos el número de particiones necesario
  if (bspRects.length < numPartitions) {
    // Si no se pudieron generar suficientes, usar las que tenemos
    // Esto puede pasar si el canvas es muy pequeño
    console.warn(`Solo se pudieron generar ${bspRects.length} particiones de ${numPartitions} solicitadas`);
  }

  // FASE 2: Mapear slots a particiones BSP
  // Priorizamos asignar slots importantes (con mayor peso) a regiones más grandes
  const slotsWithWeights = slots.map((slotId) => ({
    slotId: slotId as SlotType,
    weight: GPC_DATA.slotWeights[slotId as SlotType] || 1,
  }));

  // Ordenar slots por peso (mayor peso primero)
  slotsWithWeights.sort((a, b) => b.weight - a.weight);

  // Calcular área de cada partición y ordenarlas por tamaño
  const rectsWithArea = bspRects
    .map((rect) => ({
      rect,
      area: rect.w * rect.h,
    }))
    .sort((a, b) => b.area - a.area); // Ordenar por área descendente

  // Asignar slots a particiones y crear bloques iniciales
  const layoutBlocks: LayoutBlock[] = [];

  for (
    let i = 0;
    i < Math.min(slotsWithWeights.length, rectsWithArea.length);
    i++
  ) {
    const slotInfo = slotsWithWeights[i];
    const rectInfo = rectsWithArea[i];

    // Convertir a LayoutBlock usando valores enteros
    // Redondear hacia abajo para x,y y hacia arriba para w,h para asegurar cobertura
    const x = Math.floor(rectInfo.rect.x);
    const y = Math.floor(rectInfo.rect.y);
    const w = Math.ceil(rectInfo.rect.w);
    const h = Math.ceil(rectInfo.rect.h);

    // Asegurar que no se salga del canvas
    const finalX = Math.max(0, Math.min(x, width - 1));
    const finalY = Math.max(0, Math.min(y, height - 1));
    const finalW = Math.max(1, Math.min(w, width - finalX));
    const finalH = Math.max(1, Math.min(h, height - finalY));

    layoutBlocks.push({
      id: slotInfo.slotId,
      x: finalX,
      y: finalY,
      w: finalW,
      h: finalH,
      color: "#000000", // Se asignará después
    });
  }

  // Si hay más slots que particiones (raro pero posible si el canvas es muy pequeño)
  // Reutilizar las últimas particiones disponibles
  if (slotsWithWeights.length > rectsWithArea.length) {
    const extraSlots = slotsWithWeights.slice(rectsWithArea.length);
    const availableRects = rectsWithArea.slice(-extraSlots.length);
    
    for (let i = 0; i < extraSlots.length && i < availableRects.length; i++) {
      const slotInfo = extraSlots[i];
      const rectInfo = availableRects[i];
      
      // Usar la misma partición (esto creará solapamiento, pero es mejor que nada)
      // En la práctica, esto no debería pasar si el BSP funciona correctamente
      layoutBlocks.push({
        id: slotInfo.slotId,
        x: Math.floor(rectInfo.rect.x),
        y: Math.floor(rectInfo.rect.y),
        w: Math.max(1, Math.ceil(rectInfo.rect.w)),
        h: Math.max(1, Math.ceil(rectInfo.rect.h)),
        color: "#000000",
      });
    }
  }

  // FASE 3: Validar y corregir cualquier solapamiento usando grid
  // Esto asegura que no haya solapamientos incluso después de redondeos
  const validatedBlocks = validateAndFixPartitions(layoutBlocks, width, height);
  
  // Asignar colores a los bloques finales
  const finalBlocks: LayoutBlock[] = validatedBlocks.map((block, index) => {
    const colorIndex = Math.floor(rng.next() * palette.length);
    return {
      ...block,
      color: palette[colorIndex],
    };
  });

  return finalBlocks;
}

