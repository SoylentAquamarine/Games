# Drop Merge (dropmerge) — per-game handoff

2048-style drop puzzle: tap a column to drop the next numbered tile;
equal tiles stacked on each other merge and double, chaining for bigger
scores.

## What's here

- `index.html` — everything. `window.__drop` exposes the pure sim
  (`settle`, `gravity`, `setGrid`, `getGrid`, `ROWS`, `COLS`, `genNext`,
  `C`, spread flat too) for headless testing. Uses `/arcade.js` for
  `Arcade.stats.record("dropmerge", score)`.
- 5 columns x 8 rows by default (`C.COLS`, `C.ROWS`, admin-tunable — see
  below; `gridTemplateColumns` is set dynamically from `COLS` so the CSS
  grid always matches whatever size is configured). Next tile is always 2
  or 4 (`genNext`, 70%/30% split by default via `C.FOUR_CHANCE`), shown in
  a preview swatch before dropping.
- `settle()` cascades: after a drop, it repeatedly runs `gravity()` (columns
  compact downward) and merges the first vertical equal-pair it finds
  (lower tile absorbs, doubles), looping until nothing changes — so one
  drop can trigger a multi-step chain of merges, each adding to the score.
- Tile color is derived from its power-of-two exponent (`color()`,
  `Math.log2(v)`) indexed into a fixed 12-hue palette, darkening slightly
  for higher tiles.
- Game ends when the board is completely full and the drop can't settle
  any space free. Best score persisted to `localStorage["dropmerge_best"]`.

## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
`COLS`/`ROWS`/the 2-vs-4 spawn split pulled into a `C` object with the
standard localStorage-override IIFE (`dropmerge_config`, explicit
allowlist: `COLS`, `ROWS`, `FOUR_CHANCE`). The spawn split is exposed as
`FOUR_CHANCE` (chance of a 4, default 0.3) rather than the original
code's `<0.7?2:4` framing, since "chance of a 4" reads more naturally as
an admin field than "chance of a 2" — `genNext()`'s default behavior is
unchanged (still 70%/30%). Registered in `/admin/games/`'s
`NUMERIC_CONFIGS`. New `dropmerge-config-test.js` (5 checks: defaults
match the original hardcoded values, `C` exported both nested and flat,
and `genNext()`'s odds statistically match the original 70/30 split
over 20,000 samples) all pass. Live-verified: deployed, zero console
errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
