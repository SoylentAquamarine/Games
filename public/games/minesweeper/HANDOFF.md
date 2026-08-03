# Minesweeper (minesweeper) — per-game handoff

Classic Minesweeper: clear the grid without detonating a mine, flag
suspected mines, numbers show adjacent mine counts.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Original build: added alongside 2048, Breakout, Simon, and
  Whack-a-Mole.

## Most recent pass

No dedicated feedback pass yet beyond the original build and the
site-wide comments-widget rollout.

## Open / deferred

- **No `window.__minesweeper` test export** — worth adding if this game
  gets a future gameplay pass. A good candidate for headless testing
  since mine placement/flood-fill-reveal/first-click-safety are all pure
  logic worth verifying directly.
