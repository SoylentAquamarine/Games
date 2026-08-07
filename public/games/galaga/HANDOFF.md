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

**Player feedback: "the swooping entrance should be a bigger slower loop
that goes past more of the screen."** `enterStep()`'s quadratic-bezier
entrance: duration up from 46 to 72 frames (~57% slower), and the
midpoint control coordinate pushed further across (0.75→0.90 of the
width) and deeper down (150→210). Worth remembering for any future tune:
a quadratic bezier does NOT pass through its own midpoint coordinate at
u=0.5 — the actual peak position it swings through depends on where the
enemy's start and final formation-slot coordinates are too, so "does the
loop cover more screen" needs comparing against the old formula for the
same start/end (see `galaga-swoop-test.js` in the scratchpad for the
pattern), not an absolute on-screen threshold.

Earlier: added the admin config pane described above — no gameplay
change to the defaults.

Earlier still: sound effects wired up via `Arcade.sfx` (shared with
lander/pacman); swooping wave entrances (enemies fly into formation
instead of just appearing) plus a bomber-chicken flyby cameo; and before
that, the animated tractor-beam capture mechanic, dual-ship rescue, and
the 50% larger screen — the core gameplay-defining pass for this game.

## Open / deferred

Nothing currently open for this game.
