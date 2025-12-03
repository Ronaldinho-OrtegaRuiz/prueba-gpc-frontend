"use client";

import { useState, useMemo } from "react";
import { generateLayout } from "@/generators/layout-generator";
import { GPC_DATA } from "@/data/gpc-data";
import { LayoutBlock } from "@/types/layout";

export default function LayoutVisualizer() {
  const [seed, setSeed] = useState("2025-12-03");
  const [categoryId, setCategoryId] = useState("gastronomia");
  const [subcategoryId, setSubcategoryId] = useState("c_asia");

  // Obtener subcategorías filtradas por categoría seleccionada
  const availableSubcategories = useMemo(() => {
    return GPC_DATA.subcategories.filter(
      (sub) => sub.category === categoryId
    );
  }, [categoryId]);

  // Generar layout cuando cambian los parámetros
  const layout = useMemo(() => {
    try {
      const category = GPC_DATA.categories.find((c) => c.id === categoryId);
      const subcategory = GPC_DATA.subcategories.find(
        (s) => s.id === subcategoryId
      );

      if (!category || !subcategory) return [];

      return generateLayout({
        seed,
        category: category.name,
        subcategory: subcategory.name,
        width: 12,
        height: 20,
      });
    } catch (error) {
      console.error("Error generating layout:", error);
      return [];
    }
  }, [seed, categoryId, subcategoryId]);

  // Calcular dimensiones del grid
  const gridWidth = 12;
  const gridHeight = 20;
  const cellSize = 30; // Tamaño de cada celda en píxeles

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">
          Generador Procedimental de Layout
        </h1>
        <p className="text-gray-600 mb-8">
          Genera layouts únicos usando diagramas de Voronoi basados en semillas
        </p>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Semilla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semilla
              </label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ej: 2025-12-03"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  // Auto-seleccionar primera subcategoría de la nueva categoría
                  const firstSub = GPC_DATA.subcategories.find(
                    (s) => s.category === e.target.value
                  );
                  if (firstSub) setSubcategoryId(firstSub.id);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GPC_DATA.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Visualización del Layout */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            Layout Generado
          </h2>

          {layout.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No se pudo generar el layout. Verifica los parámetros.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grid Visual */}
              <div
                className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50"
                style={{
                  width: `${gridWidth * cellSize}px`,
                  height: `${gridHeight * cellSize}px`,
                }}
              >
                {layout.map((block, index) => (
                  <div
                    key={`${block.id}-${index}`}
                    className="absolute border-2 border-gray-800 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-lg transition-all hover:scale-105 hover:z-10"
                    style={{
                      left: `${block.x * cellSize}px`,
                      top: `${block.y * cellSize}px`,
                      width: `${block.w * cellSize}px`,
                      height: `${block.h * cellSize}px`,
                      backgroundColor: block.color,
                      textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                    }}
                    title={`${block.id} - ${block.x},${block.y} - ${block.w}x${block.h}`}
                  >
                    <span className="text-center px-1 break-words">
                      {block.id.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Lista de bloques */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">
                  Bloques del Layout ({layout.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {layout.map((block, index) => (
                    <div
                      key={`${block.id}-${index}`}
                      className="border border-gray-200 rounded-md p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded border-2 border-gray-800"
                          style={{ backgroundColor: block.color }}
                        />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {block.id.replace("_", " ")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {block.color}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Posición: ({block.x}, {block.y}) | Tamaño: {block.w} ×{" "}
                        {block.h}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

