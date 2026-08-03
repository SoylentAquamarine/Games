# Chicken Galaga (galaga) — per-game handoff

Galaga-style formation shooter: enemies swoop into formation, a tractor
beam can capture your ship (rescuable for a dual-ship power-up).

## What's here

- `index.html` — everything. `window.__galaga` exposes the pure sim for
  headless testing.
- Animated tractor beam that must actually be flown into to trigger a
  capture (not just proximity) — capturing and then rescuing your ship
  grants a dual-ship.
- Screen is 50% larger than the original size.
- `Arcade.sfx` wired up for sound (shared pass with lander, pacman).

## Most recent pass

Sound effects wired up via `Arcade.sfx`, shared with lander and pacman.
Earlier: swooping wave entrances (enemies fly into formation instead of
just appearing) plus a bomber-chicken flyby cameo. Before that: the
animated tractor-beam capture mechanic, dual-ship rescue, and the 50%
larger screen — the core gameplay-defining pass for this game.

## Open / deferred

Nothing currently open for this game.
