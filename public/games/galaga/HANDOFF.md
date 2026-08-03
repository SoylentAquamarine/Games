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
- **Admin-configurable** at `/admin/games/?game=galaga`: `BSPEED` (player
  bullet speed), `ESPEED` (enemy speed), `BEAM_HOLD` (tractor beam open
  duration). Uses the site's generic numeric-knob config pattern (see
  kaboom's HANDOFF.md) — saved to `localStorage["galaga_config"]`,
  merged into `C` at boot via an explicit allowlist.

## Most recent pass

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier passes: sound effects wired up via `Arcade.sfx` (shared with
lander/pacman); swooping wave entrances (enemies fly into formation
instead of just appearing) plus a bomber-chicken flyby cameo; and before
that, the animated tractor-beam capture mechanic, dual-ship rescue, and
the 50% larger screen — the core gameplay-defining pass for this game.

## Open / deferred

Nothing currently open for this game.
