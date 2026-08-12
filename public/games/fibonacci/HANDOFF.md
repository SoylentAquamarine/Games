# Fibonacci (fibonacci) — per-game handoff

2048-style sliding puzzle, but merges follow the Fibonacci sequence
instead of doubling: 1+1=2, 1+2=3, 2+3=5, 3+5=8, 5+8=13…

## What's here

- `index.html` — everything. `window.__fib` exposes the pure sim
  (`collapse`, `canMerge`, `FIBS`) for headless testing. Uses `/arcade.js`
  for `Arcade.stats.record("fibonacci", score)`.
- 4x4 grid. `canMerge(a,b)` is true for the special case `1+1`, or for any
  two *consecutive* entries in the `FIBS` array (`[1,2,3,5,8,13,...]`) —
  unlike 2048, only adjacent Fibonacci values merge, not equal values.
- Arrow keys / WASD / swipe move and merge every line at once via
  `collapse()`; reaching a merged value of 233+ triggers a one-time "You
  reached 233!" banner (`won` flag) without ending the game — play
  continues past it.
- New tiles are 1 (85% chance) or 2 (15%) on each move, spawned in a
  random empty cell after a successful move.
- Best score persisted to `localStorage["fib_best"]`. No admin config pane
  wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
This file had zero inline comments despite the whole point of the game
being genuinely non-obvious without one: `canMerge()`'s consecutive-
Fibonacci-numbers rule (not equal-value merging like 2048), plus
`getLine()`/`setLine()`'s direction-agnostic line read/write trick that
lets `collapse()` handle all 4 move directions with one slide-toward-
the-front implementation. Comment-only — no logic touched. Live-
verified: deployed, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
