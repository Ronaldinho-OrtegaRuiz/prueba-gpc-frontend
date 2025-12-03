import { GPCData } from "@/types/gpc";

export const GPC_DATA: GPCData = {
  "categories": [
    { "id": "gastronomia", "name": "Gastronomía" },
    { "id": "gaming", "name": "Gaming" },
    { "id": "arte", "name": "Arte" },
    { "id": "historia", "name": "Historia" },
    { "id": "ciencia", "name": "Ciencia" },
    { "id": "musica", "name": "Música" }
  ],

  "subcategories": [
    // Gastronomía
    { "id": "c_asia", "category": "gastronomia", "name": "Cocina Asiática" },
    { "id": "c_mex", "category": "gastronomia", "name": "Cocina Mexicana" },
    { "id": "c_postres", "category": "gastronomia", "name": "Postres & Repostería" },

    // Gaming
    { "id": "minecraft", "category": "gaming", "name": "Minecraft" },
    { "id": "fortnite", "category": "gaming", "name": "Fortnite" },
    { "id": "retro", "category": "gaming", "name": "Retro (8-bit)" },

    // Arte
    { "id": "vangogh", "category": "arte", "name": "Van Gogh" },
    { "id": "cubismo", "category": "arte", "name": "Cubismo" },
    { "id": "arte_moderno", "category": "arte", "name": "Arte Moderno" },

    // Historia
    { "id": "egipto", "category": "historia", "name": "Egipto Antiguo" },
    { "id": "renacimiento", "category": "historia", "name": "Renacimiento" },
    { "id": "guerras", "category": "historia", "name": "Guerras & Conflictos" },

    // Ciencia
    { "id": "astronomia", "category": "ciencia", "name": "Astronomía" },
    { "id": "biologia", "category": "ciencia", "name": "Biología Marina" },
    { "id": "fisica", "category": "ciencia", "name": "Física Teórica" },

    // Música
    { "id": "jazz", "category": "musica", "name": "Jazz" },
    { "id": "rock", "category": "musica", "name": "Rock Clásico" },
    { "id": "electro", "category": "musica", "name": "Electrónica" }
  ],

  "palettes": {
    // Gastronomía
    "c_asia": ["#FF6B6B", "#FFE66D", "#2EC4B6"],
    "c_mex": ["#8D0801", "#FFC857", "#2E294E"],
    "c_postres": ["#F7C6C7", "#FFF3B0", "#A3E4DB"],

    // Gaming
    "minecraft": ["#8CC84B", "#6B8E23", "#2F4F4F"],
    "fortnite": ["#7B61FF", "#FF5C8A", "#0B0F2A"],
    "retro": ["#FFDD57", "#FF6B6B", "#2A2D34"],

    // Arte
    "vangogh": ["#2B4C6F", "#F2C94C", "#E7A0B2"],
    "cubismo": ["#2D3142", "#F45B69", "#F6D55C"],
    "arte_moderno": ["#FF7A59", "#3DA5D9", "#F4E04D"],

    // Historia
    "egipto": ["#8B5E3C", "#EED6C4", "#3A2F2F"],
    "renacimiento": ["#6A4C93", "#F6E7D7", "#A7C4BC"],
    "guerras": ["#333333", "#B22222", "#D9D9D9"],

    // Ciencia
    "astronomia": ["#0B1226", "#1F3A93", "#A3D2CA"],
    "biologia": ["#083D77", "#16A085", "#F6F7EB"],
    "fisica": ["#0F172A", "#00B4D8", "#9BF6FF"],

    // Música
    "jazz": ["#2E1F27", "#E06283", "#F0D9FF"],
    "rock": ["#111827", "#9CA3AF", "#EF4444"],
    "electro": ["#0F172A", "#8E44AD", "#00E5FF"]
  },

  "slots": {
    "gastronomia": ["navbar", "hero", "recipe_card", "ingredients", "steps", "gallery", "footer"],
    "gaming": ["navbar", "hero", "highlight", "screenshots", "guide_list", "cta", "footer"],
    "arte": ["navbar", "hero", "artwork_showcase", "bio", "timeline", "footer"],
    "historia": ["navbar", "hero", "timeline", "article_list", "quotes", "footer"],
    "ciencia": ["navbar", "hero", "concept_card", "figure", "references", "footer"],
    "musica": ["navbar", "hero", "player", "album_grid", "tour_dates", "footer"]
  },

  "slotWeights": {
    "navbar": 1,
    "hero": 4,
    "recipe_card": 3,
    "ingredients": 2,
    "steps": 3,
    "gallery": 3,
    "highlight": 3,
    "screenshots": 3,
    "guide_list": 4,
    "artwork_showcase": 5,
    "bio": 2,
    "timeline": 3,
    "article_list": 4,
    "quotes": 1,
    "concept_card": 3,
    "figure": 2,
    "references": 1,
    "player": 3,
    "album_grid": 4,
    "tour_dates": 2,
    "cta": 2,
    "footer": 1
  }
};

