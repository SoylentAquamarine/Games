# Memory Match (memory) — per-game handoff

Classic memory/concentration: flip pairs of emoji cards, clear the board
in as few moves as possible, timed and tracked against a best score.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Tracks moves, a timer, and a persisted best score.

## Most recent pass

No dedicated feedback pass yet beyond the original build and the
site-wide comments-widget rollout.

## Open / deferred

- **No `window.__memory` test export** — worth adding if this game gets
  a future gameplay pass.
