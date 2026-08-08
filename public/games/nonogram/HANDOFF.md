# Nonogram (nonogram) — per-game handoff

Picture-logic puzzle (Picross-style): fill cells to match row/column run
clues, with 5x5/10x10/15x15 size options and a fill/mark toggle.

## What's here

- `index.html` — everything. `window.__nono` exposes `runs`, `setN`,
  `genTest`, `cluesMatchTest` for headless testing.
- The solution grid is generated randomly (`genSolution`, 55% fill
  chance) with a pass to avoid any fully-empty row or column, then clues
  are derived from it (`clues()` calling `runs()` per row/column) rather
  than the puzzle being hand-authored — so puzzles aren't guaranteed
  uniquely solvable, just guaranteed to have at least one valid solution
  (the generated grid itself).
- Two interaction modes: ✏️ Fill (left-click toggles filled) and ❌ Mark
  (right-click/context-menu always available regardless of mode, to mark
  a cell as known-empty without it counting toward the solution).
- Win check (`solved()`) compares the *player's* filled-cell runs against
  the stored clues line-by-line, not against the original solution grid
  directly — so any grid whose runs match the clues counts as solved,
  not just the exact generated one.
- An in-page `<details>` "How to play" panel explains clue notation. No
  admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
