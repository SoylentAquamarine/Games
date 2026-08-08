# Sudoku (sudoku) — per-game handoff

Standard 9x9 Sudoku with 3 difficulty levels, a number pad, live conflict
highlighting, and a solve timer.

## What's here

- `index.html` — everything. `window.__sudoku` exposes the pure generator
  (`emptyG`, `fill`, `countSol`, `makePuzzle`, `valid`) for headless
  testing.
- Puzzle generation is genuine backtracking: `fill()` recursively fills a
  random-order full solved grid, then `makePuzzle()` removes cells in
  random order one at a time, keeping each removal only if
  `countSol(...,2)` still finds exactly one solution — so every generated
  puzzle has a unique solution, not just a plausible-looking one.
- 3 difficulty levels map directly to a removal count: Easy=40, Medium=48,
  Hard=54 cells removed (`removals`, passed as `data-d` on the diff
  buttons).
- Conflicts (`conflict()`) are computed live per cell against row/column/
  3x3-box and highlighted red immediately as you type — there's no
  separate "check" step.
- Timer starts on the first entered digit (not on puzzle load) and stops
  automatically on solve. No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
