import type { Stage } from "./types";
import { detectMatches } from "./match";

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

function set(board: string[], col: number, row: number, s: string): void {
  board[row * COLS + col] = s;
}

/**
 * Stage 1 — 첫 발견.
 * 단 하나의 pre-formed 단어(사과나무)로 시작해서, 인접 스왑 한 번으로 닿을 수 있는
 * 단어 5개를 자유 음절 사이에 흩어 놓는다. 자유 음절은 무작위가 아니라 다른 단어의
 * 일부라서, 매칭 후 낙하·보충이 일어나면 연쇄로 닿을 가능성을 남긴다.
 */
function buildStage1(): Stage {
  const board = empty();

  place(board, 1, 3, ["사", "과", "나", "무"], "v");

  set(board, 1, 0, "토");
  set(board, 2, 0, "구");
  set(board, 3, 0, "끼");

  set(board, 0, 1, "하");
  set(board, 1, 1, "양");
  set(board, 2, 1, "늘");
  set(board, 3, 1, "의");

  set(board, 0, 2, "김");
  set(board, 1, 2, "풍");
  set(board, 2, 2, "치");

  set(board, 0, 0, "장");

  set(board, 3, 4, "바");
  set(board, 4, 4, "이");
  set(board, 5, 4, "다");

  set(board, 3, 6, "별");
  set(board, 4, 6, "리");
  set(board, 5, 6, "빛");

  const matches = detectMatches(board, COLS, ROWS);
  if (process.env.NODE_ENV !== "production") {
    if (matches.length !== 1 || matches[0].word !== "사과나무") {
      const found = matches.map((m) => m.word).join(", ");
      throw new Error(
        `stage1 invariant broken: expected exactly [사과나무], found [${found}]`,
      );
    }
  }

  return {
    id: 1,
    name: "첫 발견",
    cols: COLS,
    rows: ROWS,
    board,
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

export const stage1 = buildStage1();
