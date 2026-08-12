# Chicken Tetris (tetris) — per-game handoff

Classic Tetris: clear lines by fitting falling tetrominoes together.

## What's here

- `index.html` — everything. `window.__tetris` exposes the pure sim for
  headless testing.
- Chicken-themed rebrand, shared with Reversi (Othello) and Checkers in
  the original build pass.
- Uses the shared "Press Spacebar to Begin" overlay gate.

## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
The fall-speed curve (was hardcoded `Math.max(90,600-(level-1)*45)`)
pulled into a `C={BASE_INTERVAL:600, LEVEL_SPEEDUP:45, MIN_INTERVAL:90}`
object with the standard localStorage-override IIFE (`tetris_config`,
matching allowlist). Deliberately did **not** expose `COLS`/`ROWS` — 10x20
is definitional to Tetris, not a difficulty dial, same call made for
2048's `SIZE`. `window.__tetris` gained `C` (nested + spread flat) and a
new `intervalFor(level)` helper for testing the formula directly.
Registered in `/admin/games/`'s `NUMERIC_CONFIGS`. New
`tetris-config-test.js` (8 checks: defaults match the original hardcoded
values, and `intervalFor()` reproduces the exact formula at level 1,
level 2, and a floor-clamped high level) all pass. Live-verified:
deployed, confirmed the new `C` object and formula are live via a fresh
no-store fetch, zero console errors.

## Earlier pass — responsive canvas sizing

**Site-wide audit (player feedback: "all of the games need the proper
aspect ratio and screen size"): the main `#c` canvas had no responsive
sizing rule at all** — fixed at 200×400 CSS px forever. Its
`.board-wrap` parent is an unconstrained flex item with no width of
its own, so a bare `width:100%` on the canvas would resolve against
nothing; used `width:min(50vw,200px);aspect-ratio:1/2` instead (same
trick `drmario`'s `#game` rule already uses), which shrinks gracefully
on narrow screens without ever growing past its native size (avoiding
blur from upscaling a low-res board). The small `#next` preview
canvas is untouched — correctly small and fixed by design. See the
root `HANDOFF.md`'s "Canvas responsive-sizing audit" section for the
full site-wide pass this was part of (4 games fixed total).
Live-verified at a 375px mobile viewport: canvas measures
`min(50vw,200px)` ≈ 187.5px wide, exact 1:2 ratio held, zero
horizontal overflow, zero console errors.

## Earlier pass — original build

No dedicated feedback pass yet beyond the original build, the chicken
rebrand, and the site-wide comments-widget rollout.

## Open / deferred

Nothing currently open for this game.
