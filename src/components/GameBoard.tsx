"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { stages } from "@/game/stage";
import { detectMatches } from "@/game/match";
import { wordIndex } from "@/game/dictionary";
import { CATEGORY_LABEL, type Cell, type Match, type Stage } from "@/game/types";

interface Discovered {
  word: string;
  at: number;
  points: number;
}

const CLEAR_DELAY_MS = 480;

function basePointsFor(word: string): number {
  const w = wordIndex.get(word);
  return w ? 50 + (w.syllables.length - 2) * 50 : 0;
}

function cellKey(c: number, r: number) {
  return `${c}:${r}`;
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

interface StageRunnerProps {
  stage: Stage;
  stageIndex: number;
  totalStages: number;
  onAdvance: () => void;
}

function StageRunner({ stage, stageIndex, totalStages, onAdvance }: StageRunnerProps) {
  const { cols, rows, refillPool } = stage;
  const targetWords = stage.targetWords ?? [];
  const targetSet = useMemo(() => new Set(targetWords), [targetWords]);

  const [board, setBoard] = useState<string[]>(stage.board);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [discovered, setDiscovered] = useState<Discovered[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const refillIndex = useRef(0);
  const clearTimer = useRef<number | null>(null);
  const isResolving = useRef(false);

  useEffect(() => {
    return () => {
      if (clearTimer.current !== null) window.clearTimeout(clearTimer.current);
    };
  }, []);

  const matchedCells = useMemo(() => {
    const s = new Set<string>();
    activeMatches.forEach((m) =>
      m.cells.forEach((c) => s.add(cellKey(c.col, c.row))),
    );
    return s;
  }, [activeMatches]);

  const discoveredSet = useMemo(
    () => new Set(discovered.map((d) => d.word)),
    [discovered],
  );

  const foundCount = targetWords.filter((w) => discoveredSet.has(w)).length;
  const allFound =
    targetWords.length > 0 && foundCount === targetWords.length;
  const isLastStage = stageIndex >= totalStages - 1;

  const tryFormWord = useCallback(
    (next: string[], a: Cell, b: Cell) => {
      setBoard(next);

      const all = detectMatches(next, cols, rows);
      const fresh = all.filter(
        (m) =>
          targetSet.has(m.word) &&
          !discoveredSet.has(m.word) &&
          m.cells.some(
            (c) =>
              (c.col === a.col && c.row === a.row) ||
              (c.col === b.col && c.row === b.row),
          ),
      );

      if (fresh.length === 0) return;

      setActiveMatches(fresh);
      setDiscovered((d) => {
        const seen = new Set(d.map((x) => x.word));
        const adds = fresh
          .filter((m) => !seen.has(m.word))
          .map((m) => ({
            word: m.word,
            at: Date.now(),
            points: basePointsFor(m.word),
          }));
        return adds.length ? [...d, ...adds] : d;
      });
      isResolving.current = true;

      clearTimer.current = window.setTimeout(() => {
        const cleared = clearMatched(next, cols, fresh);
        const dropped = applyGravity(cleared, cols, rows);
        const { board: filled, nextIndex } = refillTop(
          dropped,
          cols,
          rows,
          refillPool,
          refillIndex.current,
        );
        refillIndex.current = nextIndex;
        setBoard(filled);
        setActiveMatches([]);
        isResolving.current = false;
      }, CLEAR_DELAY_MS);
    },
    [cols, rows, refillPool, targetSet, discoveredSet],
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

      const ai = selected.row * cols + selected.col;
      const bi = row * cols + col;
      const next = board.slice();
      [next[ai], next[bi]] = [next[bi], next[ai]];
      const from = selected;
      setSelected(null);
      tryFormWord(next, from, here);
    },
    [board, cols, selected, tryFormWord],
  );

  const score = useMemo(
    () => discovered.reduce((s, d) => s + d.points, 0),
    [discovered],
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-5xl mx-auto px-6 py-8">
      <section className="flex-1 w-full">
        <header className="mb-4">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              한글 알키오네
            </h1>
            <span className="text-xs tracking-wide uppercase text-[color:var(--muted)]">
              스테이지 {stageIndex + 1} / {totalStages}
            </span>
          </div>
          <p className="text-sm text-[color:var(--muted)] mt-1">
            {stage.name} · 두 음절을 골라 자리를 바꿔 단어를 만드세요
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

      <aside className="w-full lg:w-72 lg:sticky lg:top-8 space-y-4">
        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: "var(--tile-border)",
            background: "var(--discovered-bg)",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-medium tracking-wide uppercase text-[color:var(--muted)]">
              발견할 단어
            </h2>
            <span className="text-xs text-[color:var(--muted)]">
              {foundCount} / {targetWords.length}
            </span>
          </div>

          {targetWords.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">목표 없음</p>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {targetWords.map((word) => {
                const entry = wordIndex.get(word);
                const sylCount = entry?.syllables.length ?? word.length;
                const isFound = discoveredSet.has(word);
                return (
                  <li
                    key={word}
                    className="flex items-baseline gap-2 text-sm"
                  >
                    <span
                      className="text-xs text-[color:var(--muted)] tracking-wider tabular-nums shrink-0 w-10"
                      style={{ opacity: isFound ? 0.45 : 0.8 }}
                    >
                      {"·".repeat(sylCount)} {sylCount}
                    </span>
                    <span
                      className="font-medium"
                      style={{
                        fontFamily: "var(--font-serif)",
                        textDecoration: isFound ? "line-through" : "none",
                        color: isFound
                          ? "var(--muted)"
                          : "var(--tile-text)",
                        opacity: isFound ? 0.45 : 1,
                      }}
                    >
                      {word}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {allFound && (
            <div
              className="mt-4 pt-4 border-t"
              style={{ borderColor: "var(--tile-border)" }}
            >
              {isLastStage ? (
                <p
                  className="text-sm text-[color:var(--accent)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  모든 단계를 발견했습니다.
                </p>
              ) : (
                <button
                  onClick={onAdvance}
                  className="w-full py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    background: "var(--accent)",
                    color: "#f3ead4",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  다음 스테이지로 →
                </button>
              )}
            </div>
          )}
        </div>

        <div
          className="rounded-lg border p-4"
          style={{
            borderColor: "var(--tile-border)",
            background: "var(--discovered-bg)",
          }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-medium tracking-wide uppercase text-[color:var(--muted)]">
              발견한 단어
            </h2>
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {score}
            </span>
          </div>

          {discovered.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)]">아직 없음</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {discovered
                .slice()
                .reverse()
                .map((d) => {
                  const w = wordIndex.get(d.word);
                  return (
                    <li key={d.word} className="text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className="text-base font-medium"
                          style={{ fontFamily: "var(--font-serif)" }}
                        >
                          {d.word}
                        </span>
                        <span className="text-xs text-[color:var(--muted)]">
                          +{d.points}
                        </span>
                      </div>
                      <div className="text-[10px] uppercase tracking-wide text-[color:var(--muted)] mt-0.5">
                        {w?.categories.map((c) => CATEGORY_LABEL[c]).join(" · ")}
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

        <p className="text-xs text-[color:var(--muted)] leading-relaxed">
          MVP D1~D4 · 두 칸을 골라 자리를 바꾸면 단어가 완성됩니다.
        </p>
      </aside>
    </div>
  );
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center w-full px-6 py-16">
      <div className="flex flex-col items-center text-center gap-6 max-w-md">
        <span className="text-xs tracking-[0.3em] uppercase text-[color:var(--muted)]">
          Hangul Alcyone
        </span>
        <h1
          className="text-5xl sm:text-6xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          한글 알키오네
        </h1>
        <p
          className="text-base sm:text-lg leading-relaxed text-[color:var(--muted)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          처음 보는 사람처럼,<br />
          음절을 다시 발견하는 퍼즐.
        </p>
        <button
          onClick={onStart}
          className="mt-2 px-10 py-3 rounded-full text-base font-medium transition-transform cursor-pointer hover:scale-[1.02]"
          style={{
            background: "var(--accent)",
            color: "#f3ead4",
            fontFamily: "var(--font-serif)",
            letterSpacing: "0.08em",
          }}
        >
          시작
        </button>
        <p className="text-xs text-[color:var(--muted)] mt-2 leading-relaxed">
          4단계 · 두 음절을 골라 자리를 바꿔 단어를 만드세요
        </p>
      </div>
    </div>
  );
}

export default function GameBoard() {
  const [started, setStarted] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  if (!started) {
    return <LandingScreen onStart={() => setStarted(true)} />;
  }
  const stage = stages[stageIndex];
  return (
    <StageRunner
      key={stageIndex}
      stage={stage}
      stageIndex={stageIndex}
      totalStages={stages.length}
      onAdvance={() => setStageIndex((i) => Math.min(i + 1, stages.length - 1))}
    />
  );
}
