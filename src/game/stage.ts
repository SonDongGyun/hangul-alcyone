import type { Stage } from "./types";

const COLS = 6;
const ROWS = 8;

const empty = (): string[] => Array.from({ length: COLS * ROWS }, () => "");

function place(board: string[], col: number, row: number, syllables: string[], dir: "h" | "v"): void {
  syllables.forEach((s, i) => {
    const c = dir === "h" ? col + i : col;
    const r = dir === "v" ? row + i : row;
    board[r * COLS + c] = s;
  });
}

/**
 * Stage 1: pre-seeded with a handful of formed and almost-formed words.
 * Purpose is the first "ah-ha" moment within 30 seconds of opening the app.
 * Pre-formed matches: 사과나무 (vertical), 김치, 호랑이, 나비
 * Almost-formed: 단풍 (단,풍 are placed but separated by one swap distance)
 */
function buildStage1(): Stage {
  const board = empty();

  // 사과나무 vertical at col=1, row=0..3 — biggest "wow"
  place(board, 1, 0, ["사", "과", "나", "무"], "v");

  // 김치 horizontal at col=3, row=1
  place(board, 3, 1, ["김", "치"], "h");

  // 호랑이 horizontal at col=2, row=5
  place(board, 2, 5, ["호", "랑", "이"], "h");

  // 나비 horizontal at col=0, row=7
  place(board, 0, 7, ["나", "비"], "h");

  // 단풍 with a swap-needed: 단 at (5,2), 풍 at (5,4) — one swap with (5,3)
  board[2 * COLS + 5] = "단";
  board[4 * COLS + 5] = "풍";

  // Scattered syllables for player exploration
  const scatter: Array<[number, number, string]> = [
    [0, 0, "구"], [5, 0, "름"],
    [3, 0, "하"], [4, 0, "늘"],
    [0, 2, "달"], [3, 2, "빛"],
    [0, 4, "강"], [2, 4, "물"],
    [3, 4, "고"], [4, 4, "양"],
    [3, 5, "토"], [4, 5, "끼"],
    [0, 5, "바"], [1, 5, "다"],
    [5, 5, "이"],
    [2, 6, "거"], [3, 6, "북"],
    [3, 7, "햇"], [4, 7, "빛"],
    [5, 7, "별"],
    [0, 6, "단"], [1, 6, "풍"],
  ];
  for (const [c, r, s] of scatter) {
    if (!board[r * COLS + c]) board[r * COLS + c] = s;
  }

  return {
    id: 1,
    name: "첫 발견",
    cols: COLS,
    rows: ROWS,
    board,
  };
}

export const stage1 = buildStage1();
