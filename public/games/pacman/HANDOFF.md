# Chicken-Man (pacman) — per-game handoff

Pac-Man-style maze chase: eat dots, avoid ghosts, power pellets turn the
tables temporarily.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Arcade ghost AI (each ghost has its own classic-style targeting
  behavior, not just "chase the player" for all four).
- Smooth (non-grid-snapped) player movement and a death animation.
- `Arcade.sfx` wired up for sound (shared pass with lander, galaga).

## Most recent pass

**Player feedback: "the blue does not last long enough, we need sound
indications that the chickens are blue and that they are about to turn
back."** `FRIGHT_TICKS` (frightened-mode duration) raised from 28 to 45
ticks (4.2s → 6.75s at the 150ms step rate); `FRIGHT_WARN_TICKS` (the
pre-flip flash window) scaled up proportionally from the last 8 ticks to
the last 12. Eating a power pellet now plays a new `Arcade.sfx.power()`
cue instead of the generic pickup blip, and a new `Arcade.sfx.warn()`
beep ticks in sync with the white/blue flash during the warning window —
an audible countdown to match the existing visual one. Both new sfx were
added to the shared `arcade.js` (any game can use them).

Earlier: gentler difficulty curve with rounder colors and gliding
(interpolated, not grid-snapped) ghost movement — shared pass with
Missile Command's own curve tuning. Earlier still: classic-accurate ghost
behavior fix (was likely a simpler/uniform AI before). Original
gameplay-defining pass: smooth movement, death animation, and arcade
ghost AI all together.

## Open / deferred

- **No `window.__pacman` test export** — worth adding if this game gets a
  future gameplay pass.
