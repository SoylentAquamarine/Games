# 2048 (2048) — per-game handoff

Classic 2048: slide tiles in a direction, matching pairs merge and
double, reach the 2048 tile.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Added in the same original batch as Breakout, Simon, Minesweeper, and
  Whack-a-Mole.

## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
The spawn-odds threshold (was a hardcoded `Math.random()<.9?2:4`) pulled
into a `C={TWO_CHANCE:0.9}` object with the standard localStorage-override
IIFE (`2048_config`, allowlist: `TWO_CHANCE`). Deliberately did **not**
expose `SIZE` (the 4x4 grid) — that's definitional to "2048," not a
difficulty dial, same call made for tetris's/battleship's fixed board
dimensions. Registered in `/admin/games/`'s `NUMERIC_CONFIGS`. New
`2048-config-test.js` (3 checks, using the same DOM+controlled-
`Math.random()` harness as the existing `2048-direction-test.js` since
this game still has no `window.__2048` export) verifies the default
threshold matches the original exactly and that a localStorage override
shifts it. Live-verified: deployed, zero console errors.

While touching this file: found `2048-direction-test.js` has 3
pre-existing failing checks (RIGHT/LEFT merge direction, DOWN move) —
confirmed via `git stash` that they fail identically against the
untouched original code, so not a regression from this pass. Flagged
separately rather than fixed here (out of scope for a config-only
change) — see the "Open / deferred" note below.

## Earlier pass

No dedicated feedback pass yet beyond the original build and the
site-wide comments-widget rollout.

## Open / deferred

- **No `window.__2048` test export** — worth adding if this game gets a
  future gameplay pass.
- **`2048-direction-test.js` has 3 pre-existing failing checks** (RIGHT/
  LEFT merge direction assertions, DOWN move assertion) — confirmed
  failing against the unmodified game code too, so either a real bug in
  `move()`'s rotate-slide-rotate-back logic or a stale test expectation.
  Not yet root-caused. A likely contributing factor noticed in passing:
  the test's own `readTiles()` compares `t.v === "4"` (string) against
  `t.textContent`, which the DOM mock stores as the raw numeric grid
  value (no string coercion) — that mismatch alone would make any
  string-literal comparison against a tile's value always false,
  independent of whether the game logic itself is correct.
