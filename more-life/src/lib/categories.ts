// LOCKED: items belong to exactly one category; pairs never cross categories.
export const CATEGORIES = [
  "facades",
  "interiors",
  "streets",
  "mugs",
  "chairs",
  "textiles",
  "doors",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(v: string): v is Category {
  return (CATEGORIES as readonly string[]).includes(v);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  facades: "Facades",
  interiors: "Interiors",
  streets: "Streets",
  mugs: "Mugs & vessels",
  chairs: "Chairs",
  textiles: "Textiles",
  doors: "Doors",
};

// Generic alt text per category — never the item's identity (research integrity).
export const CATEGORY_ALT: Record<Category, string> = {
  facades: "A building exterior",
  interiors: "An interior space",
  streets: "A streetscape or public space",
  mugs: "A mug, cup, or drinking vessel",
  chairs: "A chair or seat",
  textiles: "A textile, carpet, or woven pattern",
  doors: "A door, doorway, or gate",
};

export type Pool = "curated" | "community";
export function isPool(v: string): v is Pool {
  return v === "curated" || v === "community";
}
