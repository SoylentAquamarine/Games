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

Gentler difficulty curve with rounder colors and gliding (interpolated,
not grid-snapped) ghost movement — shared pass with Missile Command's own
curve tuning. Earlier: classic-accurate ghost behavior fix (was likely a
simpler/uniform AI before). Original gameplay-defining pass: smooth
movement, death animation, and arcade ghost AI all together.

## Open / deferred

- **No `window.__pacman` test export** — worth adding if this game gets a
  future gameplay pass.
