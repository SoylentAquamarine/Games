# Egg Shooter (bubbleshooter) — per-game handoff

Bubble Shooter-style aim-and-match: fire eggs up into a field, match 3+
of the same color to clear them.

## What's here

- `index.html` — everything. `window.__bubble` exposes the pure sim for
  headless testing.
- Calmer egg field and an interlude flyby, added in the same pass as
  Asteroids' own interlude flyby.

## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
Shot speed (was a hardcoded `const sp=16` inside `shoot()`, itself the
result of the earlier speed-consistency fix below) and the starting
filled-row count (was a hardcoded `r<5` loop bound) pulled into a
`C={SHOT_SPEED:16, START_ROWS:5}` object with the standard
localStorage-override IIFE (`bubbleshooter_config`, matching allowlist).
`START_ROWS`'s admin field is capped at 12, safely under the fixed
14-row board (`rows=14`), to avoid writing past the grid array.
Registered in `/admin/games/`'s `NUMERIC_CONFIGS`. `eggshooter-speed-
test.js`'s literal-text check (`/const sp=16;/`) needed updating for the
deliberate rename — now checks for `C.SHOT_SPEED` with a separate check
that it still defaults to 16; all its other checks (loop-stacking
prevention, actual runtime behavior) were unaffected and still pass. New
`bubbleshooter-config-test.js` (7 checks) covers both knobs' defaults
and overrides. Live-verified: deployed, zero console errors.

## Earlier pass

Fixed every shot traveling at one consistent speed — it used to get
faster with each shot, which made later shots harder to aim on reflex
rather than on genuine difficulty. Earlier: the original build — calmer
egg field, interlude flyby, added as a new game alongside a pass on
Asteroids.

## Open / deferred

Nothing currently open for this game.
