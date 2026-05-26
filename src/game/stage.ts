import type { Stage } from "./types";
import { detectMatches } from "./match";

function emptyBoard(cols: number, rows: number): string[] {
  return Array.from({ length: cols * rows }, () => "");
}

function set(board: string[], cols: number, col: number, row: number, s: string): void {
  board[row * cols + col] = s;
}

function place(
  board: string[],
  cols: number,
  col: number,
  row: number,
  syllables: string[],
  dir: "h" | "v",
): void {
  syllables.forEach((s, i) => {
    const c = dir === "h" ? col + i : col;
    const r = dir === "v" ? row + i : row;
    board[r * cols + c] = s;
  });
}

/**
 * Stage 1 — 첫 발견. 4×4의 작은 정원.
 * pre-formed: 사과 / 1-swap: 사과나무(합성어 트릭), 바다.
 */
function buildStage1(): Stage {
  const cols = 4, rows = 4;
  const board = emptyBoard(cols, rows);
  place(board, cols, 0, 0, ["사", "과", "나"], "h");
  set(board, cols, 3, 0, "토");
  set(board, cols, 3, 1, "무");
  place(board, cols, 0, 2, ["바", "강", "다"], "h");
  return {
    id: 1,
    name: "첫 발견",
    cols,
    rows,
    board,
    targetWords: ["사과", "사과나무", "바다"],
    refillPool: ["구", "름", "달", "빛", "별", "바", "다", "강", "물", "하", "늘"],
  };
}

/**
 * Stage 2 — 결합의 순간. 5×6.
 * pre-formed: 김치찌개(4글자), 바다(세로) / 1-swap: 하늘, 별빛, 호랑이.
 */
function buildStage2(): Stage {
  const cols = 5, rows = 6;
  const board = emptyBoard(cols, rows);
  set(board, cols, 0, 0, "하");
  set(board, cols, 1, 0, "구");
  set(board, cols, 2, 0, "늘");
  set(board, cols, 3, 0, "바");
  set(board, cols, 4, 0, "빛");
  set(board, cols, 3, 1, "다");
  set(board, cols, 4, 1, "별");
  place(board, cols, 0, 2, ["김", "치", "찌", "개"], "h");
  set(board, cols, 0, 4, "호");
  set(board, cols, 1, 4, "랑");
  set(board, cols, 2, 4, "양");
  set(board, cols, 3, 4, "이");
  return {
    id: 2,
    name: "결합의 순간",
    cols,
    rows,
    board,
    targetWords: ["김치찌개", "바다", "하늘", "별빛", "호랑이"],
    refillPool: [
      "고", "양", "이", "토", "끼",
      "사", "과", "나", "무",
      "바", "람", "단", "풍",
      "달", "구", "름",
    ],
  };
}

/**
 * Stage 3 — 이어진 잎. 6×7.
 * pre-formed: 단풍나무 / 1-swap: 거북이, 강물, 물고기, 햇빛.
 */
function buildStage3(): Stage {
  const cols = 6, rows = 7;
  const board = emptyBoard(cols, rows);
  place(board, cols, 1, 0, ["단", "풍", "나", "무"], "v");
  set(board, cols, 2, 0, "거");
  set(board, cols, 3, 0, "북");
  set(board, cols, 4, 0, "리");
  set(board, cols, 5, 0, "이");
  set(board, cols, 0, 4, "강");
  set(board, cols, 1, 4, "고");
  set(board, cols, 2, 4, "물");
  set(board, cols, 2, 5, "물");
  set(board, cols, 3, 5, "고");
  set(board, cols, 4, 5, "양");
  set(board, cols, 5, 5, "기");
  set(board, cols, 2, 6, "햇");
  set(board, cols, 3, 6, "구");
  set(board, cols, 4, 6, "빛");
  return {
    id: 3,
    name: "이어진 잎",
    cols,
    rows,
    board,
    targetWords: ["단풍나무", "거북이", "강물", "물고기", "햇빛"],
    refillPool: [
      "하", "늘", "색", "별", "달",
      "구", "름", "바", "다",
      "김", "치", "고", "양", "이",
    ],
  };
}

/**
 * Stage 4 — 처음 보는 일상. 6×8.
 * pre-formed: 사과나무 / 1-swap: 토끼, 하늘, 김치, 바다, 별빛.
 */
function buildStage4(): Stage {
  const cols = 6, rows = 8;
  const board = emptyBoard(cols, rows);
  place(board, cols, 1, 3, ["사", "과", "나", "무"], "v");
  set(board, cols, 1, 0, "토");
  set(board, cols, 2, 0, "구");
  set(board, cols, 3, 0, "끼");
  set(board, cols, 0, 1, "하");
  set(board, cols, 1, 1, "양");
  set(board, cols, 2, 1, "늘");
  set(board, cols, 3, 1, "의");
  set(board, cols, 0, 2, "김");
  set(board, cols, 1, 2, "풍");
  set(board, cols, 2, 2, "치");
  set(board, cols, 0, 0, "장");
  set(board, cols, 3, 4, "바");
  set(board, cols, 4, 4, "이");
  set(board, cols, 5, 4, "다");
  set(board, cols, 3, 6, "별");
  set(board, cols, 4, 6, "리");
  set(board, cols, 5, 6, "빛");
  return {
    id: 4,
    name: "처음 보는 일상",
    cols,
    rows,
    board,
    targetWords: ["사과나무", "토끼", "하늘", "김치", "바다", "별빛"],
    refillPool: [
      "구", "름", "달", "빛", "별",
      "바", "다", "강", "물",
      "호", "랑", "이",
      "고", "양", "풍",
      "단", "나", "무",
      "김", "치", "밥",
      "하", "늘", "색",
      "의", "자", "거", "울",
    ],
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

verify(s1, ["사과"]);
verify(s2, ["김치찌개", "바다"]);
verify(s3, ["단풍나무"]);
verify(s4, ["사과나무"]);

export const stages: Stage[] = [s1, s2, s3, s4];
export const stage1 = s1;
