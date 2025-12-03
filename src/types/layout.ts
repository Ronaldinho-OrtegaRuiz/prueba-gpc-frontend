import { SlotType } from "./gpc";

export interface LayoutBlock {
  id: SlotType;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface GenerateLayoutParams {
  seed: string;
  category: string;
  subcategory: string;
  width?: number; // Ancho del canvas/container (default: 12)
  height?: number; // Alto del canvas/container (default: 20)
}

export type Layout = LayoutBlock[];

