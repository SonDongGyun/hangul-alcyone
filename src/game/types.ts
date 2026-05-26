export type CategoryId = "food" | "animal" | "nature" | "daily";

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  food: "음식",
  animal: "동물",
  nature: "자연",
  daily: "일상",
};

export interface WordEntry {
  word: string;
  syllables: string[];
  categories: CategoryId[];
  frequency: 1 | 2 | 3 | 4 | 5;
  meaning?: string;
}

export interface Stage {
  id: number;
  name: string;
  cols: number;
  rows: number;
  /** Row-major array of syllable strings. Empty string means empty cell. */
  board: string[];
  targetWords?: string[];
}

export interface Cell {
  col: number;
  row: number;
}

export interface Match {
  word: string;
  cells: Cell[];
  direction: "horizontal" | "vertical";
}
