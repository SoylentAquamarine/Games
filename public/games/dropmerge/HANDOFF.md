# Drop Merge (dropmerge) — per-game handoff

2048-style drop puzzle: tap a column to drop the next numbered tile;
equal tiles stacked on each other merge and double, chaining for bigger
scores.

## What's here

- `index.html` — everything. `window.__drop` exposes the pure sim
  (`settle`, `gravity`, `setGrid`, `getGrid`, `ROWS`, `COLS`) for headless
  testing. Uses `/arcade.js` for `Arcade.stats.record("dropmerge", score)`.
- 5 columns x 8 rows (`COLS`, `ROWS`). Next tile is always 2 or 4
  (`genNext`, 70%/30% split), shown in a preview swatch before dropping.
- `settle()` cascades: after a drop, it repeatedly runs `gravity()` (columns
  compact downward) and merges the first vertical equal-pair it finds
  (lower tile absorbs, doubles), looping until nothing changes — so one
  drop can trigger a multi-step chain of merges, each adding to the score.
- Tile color is derived from its power-of-two exponent (`color()`,
  `Math.log2(v)`) indexed into a fixed 12-hue palette, darkening slightly
  for higher tiles.
- Game ends when the board is completely full and the drop can't settle
  any space free. Best score persisted to `localStorage["dropmerge_best"]`.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
