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

function cellKey(c: number, r: number) {
  return `${c}:${r}`;
}

function areAdjacent(a: Cell, b: Cell) {
  const dc = Math.abs(a.col - b.col);
  const dr = Math.abs(a.row - b.row);
  return dc + dr === 1;
}

export default function GameBoard() {
  const { cols, rows } = stage1;
  const [board, setBoard] = useState<string[]>(stage1.board);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [discovered, setDiscovered] = useState<Discovered[]>([]);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [rejectKey, setRejectKey] = useState<string | null>(null);
  const knownMatchKeys = useRef<Set<string>>(new Set());

  // Initial scan: detect what's already on the board so the player sees it lit up
  useEffect(() => {
    const initial = detectMatches(stage1.board, cols, rows);
    setActiveMatches(initial);
    initial.forEach((m) => knownMatchKeys.current.add(matchKey(m)));
    setDiscovered(
      initial.map((m) => ({ word: m.word, at: Date.now() })),
    );
  }, [cols, rows]);

  const matchedCells = useMemo(() => {
    const s = new Set<string>();
    activeMatches.forEach((m) =>
      m.cells.forEach((c) => s.add(cellKey(c.col, c.row))),
    );
    return s;
  }, [activeMatches]);

  const tryMatchOrRevert = useCallback(
    (next: string[], swappedA: Cell, swappedB: Cell) => {
      const all = detectMatches(next, cols, rows);
      const fresh = all.filter((m) => !knownMatchKeys.current.has(matchKey(m)));

      if (fresh.length === 0) {
        // Reject — flash and revert
        setRejectKey(cellKey(swappedA.col, swappedA.row));
        window.setTimeout(() => setRejectKey(null), 280);
        return;
      }

      // Accept swap; mark new matches as known
      fresh.forEach((m) => knownMatchKeys.current.add(matchKey(m)));
      setBoard(next);
      setActiveMatches(all);
      setDiscovered((d) => {
        const seen = new Set(d.map((x) => x.word));
        const adds = fresh
          .filter((m) => !seen.has(m.word))
          .map((m) => ({ word: m.word, at: Date.now() }));
        return [...d, ...adds];
      });
    },
    [cols, rows],
  );

  const onTileClick = useCallback(
    (col: number, row: number) => {
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
      tryMatchOrRevert(next, selected, here);
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
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
              {score}
            </span>
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
          MVP D1~D3 · 가로/세로 인접 매칭, 합성어(사과나무) 우선 매칭. 콤보·낙하·점수 가중치는 D5+.
        </p>
      </aside>
    </div>
  );
}
