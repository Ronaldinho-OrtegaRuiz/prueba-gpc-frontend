export type SlotType =
  | "navbar"
  | "hero"
  | "recipe_card"
  | "ingredients"
  | "steps"
  | "gallery"
  | "highlight"
  | "screenshots"
  | "guide_list"
  | "artwork_showcase"
  | "bio"
  | "timeline"
  | "article_list"
  | "quotes"
  | "concept_card"
  | "figure"
  | "references"
  | "player"
  | "album_grid"
  | "tour_dates"
  | "cta"
  | "footer";

export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  category: string;
  name: string;
}

export interface Palettes {
  [subcategoryId: string]: string[];
}

export interface Slots {
  [categoryId: string]: SlotType[];
}

export interface SlotWeights {
  [slotId: string]: number;
}

export interface GPCData {
  categories: Category[];
  subcategories: Subcategory[];
  palettes: Palettes;
  slots: Slots;
  slotWeights: SlotWeights;
}

