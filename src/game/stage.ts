import type { Stage } from "./types";
import { detectMatches } from "./match";

function emptyBoard(cols: number, rows: number): string[] {
  return Array.from({ length: cols * rows }, () => "");
}

function set(board: string[], cols: number, col: number, row: number, s: string): void {
  board[row * cols + col] = s;
}

function row(board: string[], cols: number, col: number, row: number, syllables: string[]): void {
  syllables.forEach((s, i) => set(board, cols, col + i, row, s));
}

const NEUTRAL_POOL = ["풍", "구", "토", "강", "단", "무", "자", "의"];

function buildStage1(): Stage {
  const cols = 4, rows = 4;
  const board = emptyBoard(cols, rows);
  row(board, cols, 0, 0, ["사", "의", "과", "자"]);
  row(board, cols, 0, 1, ["바", "강", "다", "구"]);
  row(board, cols, 0, 2, ["별", "풍", "빛", "토"]);
  row(board, cols, 0, 3, ["단", "무", "자", "의"]);
  return {
    id: 1,
    name: "첫 발견",
    cols,
    rows,
    board,
    targetWords: ["사과", "바다", "별빛"],
    refillPool: NEUTRAL_POOL,
  };
}

function buildStage2(): Stage {
  const cols = 5, rows = 6;
  const board = emptyBoard(cols, rows);
  row(board, cols, 0, 0, ["풍", "하", "구", "늘", "자"]);
  row(board, cols, 0, 1, ["자", "강", "의", "단", "무"]);
  row(board, cols, 0, 2, ["김", "치", "찌", "개", "토"]);
  row(board, cols, 0, 3, ["풍", "호", "랑", "자", "이"]);
  row(board, cols, 0, 4, ["자", "별", "단", "빛", "풍"]);
  row(board, cols, 0, 5, ["토", "바", "무", "다", "강"]);
  return {
    id: 2,
    name: "결합의 순간",
    cols,
    rows,
    board,
    targetWords: ["김치찌개", "바다", "하늘", "별빛", "호랑이"],
    refillPool: NEUTRAL_POOL,
  };
}

function buildStage3(): Stage {
  const cols = 6, rows = 7;
  const board = emptyBoard(cols, rows);
  row(board, cols, 0, 0, ["자", "단", "풍", "나", "무", "토"]);
  row(board, cols, 0, 1, ["풍", "자", "풍", "자", "풍", "자"]);
  row(board, cols, 0, 2, ["강", "자", "물", "풍", "자", "풍"]);
  row(board, cols, 0, 3, ["자", "풍", "자", "풍", "자", "풍"]);
  row(board, cols, 0, 4, ["물", "고", "자", "기", "풍", "자"]);
  row(board, cols, 0, 5, ["거", "북", "자", "이", "풍", "자"]);
  row(board, cols, 0, 6, ["햇", "자", "빛", "풍", "자", "풍"]);
  return {
    id: 3,
    name: "이어진 잎",
    cols,
    rows,
    board,
    targetWords: ["단풍나무", "거북이", "강물", "물고기", "햇빛"],
    refillPool: NEUTRAL_POOL,
  };
}

function buildStage4(): Stage {
  const cols = 6, rows = 8;
  const board = emptyBoard(cols, rows);
  row(board, cols, 0, 0, ["자", "사", "과", "나", "무", "토"]);
  row(board, cols, 0, 1, ["풍", "자", "풍", "자", "풍", "자"]);
  row(board, cols, 0, 2, ["토", "자", "끼", "풍", "자", "풍"]);
  row(board, cols, 0, 3, ["자", "풍", "자", "풍", "자", "풍"]);
  row(board, cols, 0, 4, ["하", "자", "늘", "풍", "자", "풍"]);
  row(board, cols, 0, 5, ["김", "자", "치", "풍", "자", "풍"]);
  row(board, cols, 0, 6, ["바", "자", "다", "풍", "자", "풍"]);
  row(board, cols, 0, 7, ["별", "자", "빛", "풍", "자", "풍"]);
  return {
    id: 4,
    name: "처음 보는 일상",
    cols,
    rows,
    board,
    targetWords: ["사과나무", "토끼", "하늘", "김치", "바다", "별빛"],
    refillPool: NEUTRAL_POOL,
  };
}

function verify(stage: Stage, expected: string[]): void {
  const matches = detectMatches(stage.board, stage.cols, stage.rows);
  const got = matches.map((m) => m.word).sort();
  const exp = expected.slice().sort();
  if (got.length !== exp.length || got.some((w, i) => w !== exp[i])) {
    throw new Error(
      `Stage ${stage.id} invariant: expected [${exp.join(", ")}], got [${got.join(", ")}]`,
    );
  }
}

const s1 = buildStage1();
const s2 = buildStage2();
const s3 = buildStage3();
const s4 = buildStage4();

verify(s1, []);
verify(s2, ["김치찌개"]);
verify(s3, ["단풍나무"]);
verify(s4, ["사과나무"]);

export const stages: Stage[] = [s1, s2, s3, s4];
export const stage1 = s1;
