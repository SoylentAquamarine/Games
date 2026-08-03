# Connect Four (connect4) — per-game handoff

Classic Connect Four: drop discs to build a 4-in-a-row before the
opponent does. CPU opponent (alpha-beta AI) or 2-player local.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- CPU opponent uses alpha-beta search (`feat(games): add Connect Four
  (alpha-beta AI + 2-player)`), not a random/heuristic-only bot.

## Most recent pass

No dedicated feedback pass yet beyond the original build and the
site-wide comments-widget rollout.

## Open / deferred

- **No `window.__connect4` test export** — worth adding if this game
  gets a future gameplay pass, especially useful here since the AI
  search itself is a good target for headless correctness tests (does it
  actually block/take a winning move in a given position).
