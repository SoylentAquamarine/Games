# Piano Tiles (pianotiles) — per-game handoff

Piano Tiles-style reflex game: tap only the black tile in each falling
row, in order, before it scrolls off the bottom — missing one or tapping
a white tile ends the run.

## What's here

- `index.html` — everything, canvas-based. `window.__pianotiles` exposes
  the pure sim (`newState`, `step`, `tapColumn`, `lowestUntapped`, `C`)
  for headless testing.
- Uses the shared `/arcade.js` `Arcade.startGate` (press-to-begin gate)
  and `Arcade.stats.record("pianotiles", s.score)`.
- 4 columns; each row (`makeRow`) has exactly one randomly-chosen "black"
  (correct) column. Rows recycle once fully scrolled past the bottom
  (`kept` array in `step()`), continuously generating new rows above so
  the track is effectively endless.
- Speed increases slightly with every successful tap (`s.speed+=0.04`,
  capped at `C.MAX_SPEED`). A black tile scrolling past the bottom
  untapped ends the game, as does tapping any white tile.
- Controls: click/tap on the canvas column, or keyboard A/S/D/F mapped to
  columns 0-3.
- Best score persisted to `localStorage["piano_best"]`. No admin config
  pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
