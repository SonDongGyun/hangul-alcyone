import { wordSet, maxWordSyllables } from "./dictionary";
import type { Match } from "./types";

/**
 * Scan board for horizontal/vertical word matches.
 * Longer-word-first: at each position, try the longest possible run before
 * shorter ones. This means "사과나무" wins over "사과" + "나무" when
 * 4 syllables align.
 */
export function detectMatches(
  board: string[],
  cols: number,
  rows: number,
): Match[] {
  const matches: Match[] = [];

  const idx = (c: number, r: number) => r * cols + c;

  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      let consumed = 1;
      if (board[idx(c, r)]) {
        for (let len = Math.min(maxWordSyllables, cols - c); len >= 2; len--) {
          let word = "";
          let ok = true;
          for (let k = 0; k < len; k++) {
            const s = board[idx(c + k, r)];
            if (!s) {
              ok = false;
              break;
            }
            word += s;
          }
          if (ok && wordSet.has(word)) {
            matches.push({
              word,
              direction: "horizontal",
              cells: Array.from({ length: len }, (_, k) => ({
                col: c + k,
                row: r,
              })),
            });
            consumed = len;
            break;
          }
        }
      }
      c += consumed;
    }
  }

  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      let consumed = 1;
      if (board[idx(c, r)]) {
        for (let len = Math.min(maxWordSyllables, rows - r); len >= 2; len--) {
          let word = "";
          let ok = true;
          for (let k = 0; k < len; k++) {
            const s = board[idx(c, r + k)];
            if (!s) {
              ok = false;
              break;
            }
            word += s;
          }
          if (ok && wordSet.has(word)) {
            matches.push({
              word,
              direction: "vertical",
              cells: Array.from({ length: len }, (_, k) => ({
                col: c,
                row: r + k,
              })),
            });
            consumed = len;
            break;
          }
        }
      }
      r += consumed;
    }
  }

  return matches;
}

export function matchKey(m: Match): string {
  return `${m.direction}:${m.word}:${m.cells[0].col}:${m.cells[0].row}`;
}
