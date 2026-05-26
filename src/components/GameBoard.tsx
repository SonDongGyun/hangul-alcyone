"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { stage1 } from "@/game/stage";
import { detectMatches, matchKey } from "@/game/match";
import { wordIndex } from "@/game/dictionary";
import { CATEGORY_LABEL, type Cell, type Match } from "@/game/types";

interface Discovered {
  word: string;
  at: number;
}

const CHAIN_DELAY_MS = 480;
const CLEAR_PAUSE_MS = 220;

function cellKey(c: number, r: number) {
  return `${c}:${r}`;
}

function areAdjacent(a: Cell, b: Cell) {
  const dc = Math.abs(a.col - b.col);
  const dr = Math.abs(a.row - b.row);
  return dc + dr === 1;
}

function clearMatched(board: string[], cols: number, matches: Match[]): string[] {
  const out = board.slice();
  for (const m of matches) {
    for (const cell of m.cells) {
      out[cell.row * cols + cell.col] = "";
    }
  }
  return out;
}

function applyGravity(board: string[], cols: number, rows: number): string[] {
  const out = board.slice();
  for (let c = 0; c < cols; c++) {
    const stack: string[] = [];
    for (let r = 0; r < rows; r++) {
      const v = out[r * cols + c];
      if (v) stack.push(v);
    }
    const padding = rows - stack.length;
    for (let r = 0; r < rows; r++) {
      out[r * cols + c] = r < padding ? "" : stack[r - padding];
    }
  }
  return out;
}

function refillTop(
  board: string[],
  cols: number,
  rows: number,
  pool: string[],
  startIdx: number,
): { board: string[]; nextIndex: number } {
  if (!pool.length) return { board, nextIndex: startIdx };
  const out = board.slice();
  let idx = startIdx;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const i = r * cols + c;
      if (out[i]) break;
      out[i] = pool[idx % pool.length];
      idx++;
    }
  }
  return { board: out, nextIndex: idx };
}

export default function GameBoard() {
  const { cols, rows } = stage1;
  const [board, setBoard] = useState<string[]>(stage1.board);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [discovered, setDiscovered] = useState<Discovered[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [rejectKey, setRejectKey] = useState<string | null>(null);
  const [comboDepth, setComboDepth] = useState(0);
  const knownMatchKeys = useRef<Set<string>>(new Set());
  const refillIndex = useRef(0);
  const chainTimer = useRef<number | null>(null);
  const isResolving = useRef(false);

  useEffect(() => {
    const initial = detectMatches(stage1.board, cols, rows);
    setActiveMatches(initial);
    initial.forEach((m) => knownMatchKeys.current.add(matchKey(m)));
    setDiscovered(initial.map((m) => ({ word: m.word, at: Date.now() })));
  }, [cols, rows]);

  useEffect(() => {
    return () => {
      if (chainTimer.current !== null) window.clearTimeout(chainTimer.current);
    };
  }, []);

  const matchedCells = useMemo(() => {
    const s = new Set<string>();
    activeMatches.forEach((m) =>
      m.cells.forEach((c) => s.add(cellKey(c.col, c.row))),
    );
    return s;
  }, [activeMatches]);

  const addDiscovered = useCallback((matches: Match[]) => {
    if (!matches.length) return;
    setDiscovered((d) => {
      const seen = new Set(d.map((x) => x.word));
      const adds = matches
        .filter((m) => !seen.has(m.word))
        .map((m) => ({ word: m.word, at: Date.now() }));
      return adds.length ? [...d, ...adds] : d;
    });
  }, []);

  const runChainStep = useCallback(
    (currentBoard: string[], toClear: Match[], depth: number) => {
      for (const m of toClear) knownMatchKeys.current.delete(matchKey(m));
      const cleared = clearMatched(currentBoard, cols, toClear);
      const dropped = applyGravity(cleared, cols, rows);
      const { board: filled, nextIndex } = refillTop(
        dropped,
        cols,
        rows,
        stage1.refillPool,
        refillIndex.current,
      );
      refillIndex.current = nextIndex;
      setBoard(filled);
      setActiveMatches([]);

      chainTimer.current = window.setTimeout(() => {
        const newMatches = detectMatches(filled, cols, rows);
        if (newMatches.length === 0) {
          setComboDepth(0);
          isResolving.current = false;
          return;
        }
        newMatches.forEach((m) => knownMatchKeys.current.add(matchKey(m)));
        setActiveMatches(newMatches);
        addDiscovered(newMatches);
        setComboDepth(depth + 1);
        chainTimer.current = window.setTimeout(
          () => runChainStep(filled, newMatches, depth + 1),
          CHAIN_DELAY_MS,
        );
      }, CLEAR_PAUSE_MS);
    },
    [cols, rows, addDiscovered],
  );

  const tryMatchOrRevert = useCallback(
    (next: string[], swappedA: Cell) => {
      const all = detectMatches(next, cols, rows);
      const fresh = all.filter((m) => !knownMatchKeys.current.has(matchKey(m)));

      if (fresh.length === 0) {
        setRejectKey(cellKey(swappedA.col, swappedA.row));
        window.setTimeout(() => setRejectKey(null), 280);
        return;
      }

      fresh.forEach((m) => knownMatchKeys.current.add(matchKey(m)));
      setBoard(next);
      setActiveMatches(all);
      addDiscovered(fresh);
      isResolving.current = true;
      setComboDepth(1);

      chainTimer.current = window.setTimeout(
        () => runChainStep(next, fresh, 1),
        CHAIN_DELAY_MS,
      );
    },
    [cols, rows, addDiscovered, runChainStep],
  );

  const onTileClick = useCallback(
    (col: number, row: number) => {
      if (isResolving.current) return;
      const here: Cell = { col, row };
      if (!board[row * cols + col]) {
        setSelected(null);
        return;
      }
      if (!selected) {
        setSelected(here);
        return;
      }
      if (selected.col === col && selected.row === row) {
        setSelected(null);
        return;
      }
      if (!areAdjacent(selected, here)) {
        setSelected(here);
        return;
      }

      const a = selected.row * cols + selected.col;
      const b = row * cols + col;
      const next = board.slice();
      [next[a], next[b]] = [next[b], next[a]];
      setSelected(null);
      tryMatchOrRevert(next, selected);
    },
    [board, cols, selected, tryMatchOrRevert],
  );

  const score = useMemo(
    () =>
      discovered.reduce((s, d) => {
        const w = wordIndex.get(d.word);
        return s + (w ? 50 + (w.syllables.length - 2) * 50 : 0);
      }, 0),
    [discovered],
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-5xl mx-auto px-6 py-8">
      <section className="flex-1 w-full">
        <header className="mb-4">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            한글 알키오네
          </h1>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            {stage1.name} · 인접한 두 음절을 클릭해 단어를 만드세요
          </p>
        </header>

        <div
          className="grid gap-1.5 select-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxWidth: `${cols * 72}px`,
          }}
        >
          {board.map((syllable, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const isSelected =
              selected?.col === col && selected?.row === row;
            const isMatched = matchedCells.has(cellKey(col, row));
            const isReject = rejectKey === cellKey(col, row);
            return (
              <button
                key={i}
                onClick={() => onTileClick(col, row)}
                disabled={!syllable}
                aria-label={syllable || "빈 칸"}
                className={[
                  "aspect-square flex items-center justify-center text-2xl font-medium rounded-md transition-colors",
                  syllable
                    ? "border cursor-pointer"
                    : "border border-dashed opacity-30 cursor-default",
                  isMatched ? "tile-match" : "",
                  isReject ? "tile-reject" : "",
                ].join(" ")}
                style={{
                  background: isSelected
                    ? "var(--tile-bg-selected)"
                    : isMatched
                    ? "var(--match-glow)"
                    : "var(--tile-bg)",
                  color: isMatched ? "#fff" : "var(--tile-text)",
                  borderColor: "var(--tile-border)",
                  fontFamily: isMatched
                    ? "var(--font-serif)"
                    : "var(--font-sans)",
                }}
              >
                {syllable || ""}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="w-full lg:w-72 lg:sticky lg:top-8">
        <div className="rounded-lg border p-4" style={{ borderColor: "var(--tile-border)", background: "var(--discovered-bg)" }}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-medium tracking-wide uppercase text-[color:var(--muted)]">
              발견한 단어
            </h2>
            <div className="flex items-baseline gap-2">
              {comboDepth >= 2 && (
                <span
                  className="text-xs tracking-wide text-[color:var(--accent)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  연쇄 ×{comboDepth}
                </span>
              )}
              <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                {score}
              </span>
            </div>
          </div>

          {discovered.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">아직 없음</p>
          ) : (
            <ul className="space-y-2">
              {discovered.slice().reverse().map((d) => {
                const w = wordIndex.get(d.word);
                return (
                  <li key={d.word} className="text-sm">
                    <div className="flex items-baseline justify-between">
                      <span
                        className="text-base font-medium"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {d.word}
                      </span>
                      <span className="text-xs text-[color:var(--muted)]">
                        {w?.categories.map((c) => CATEGORY_LABEL[c]).join("·")}
                      </span>
                    </div>
                    {w?.meaning && (
                      <p className="text-xs text-[color:var(--muted)] mt-0.5">
                        {w.meaning}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="text-xs text-[color:var(--muted)] mt-4 leading-relaxed">
          MVP D1~D4 · 매칭 후 음절이 비고, 위에서 채워지며 연쇄가 일어납니다.
        </p>
      </aside>
    </div>
  );
}
