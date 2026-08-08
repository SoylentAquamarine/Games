# 15 Puzzle (fifteen) — per-game handoff

Classic sliding tile puzzle: arrange numbered tiles into order around a
single blank space, with selectable 3x3/4x4/5x5 board sizes.

## What's here

- `index.html` — everything. `window.__fifteen` exposes the pure sim
  (`solvedBoard`, `setN`, `shuffleTest`, `isSolvable`) for headless
  testing.
- Shuffling (`shuffle`) works by making many random legal slides from the
  solved state (`N*N*80` of them, never immediately undoing the last
  move) rather than a random permutation — this guarantees every shuffled
  board is solvable by construction. It re-shuffles if the result happens
  to already be solved.
- `isSolvable(b)` (exposed for tests) is a separate independent
  parity-check implementation (inversion count + blank row, with the
  odd/even-width formulas differing) — useful for verifying the
  construction-based shuffle actually produces solvable boards.
- Board size switch (3x3/4x4/5x5) fully rebuilds the grid and reshuffles.
  Tracks move count and an elapsed-time timer that starts on the first
  move.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
