# Chicken Galaga (galaga) — per-game handoff

Galaga-style formation shooter: enemies swoop into formation, a tractor
beam can capture your ship (rescuable for a dual-ship power-up).

## What's here

- `index.html` — everything. `window.__galaga` exposes the pure sim for
  headless testing.
- Animated tractor beam that must actually be flown into to trigger a
  capture (not just proximity) — capturing and then rescuing your ship
  grants a dual-ship. A capture spends a life and continues play on a
  fresh, recentred single fighter, with a brief non-blocking
  `s.captureFlash` "SHIP CAPTURED!" beat so the loss is visible, matching
  the life-loss convention used elsewhere on the site.
- Enemies are drawn as real chickens (`drawEnemy`): wings, body, comb,
  beak, eyes — comb/beak stay their normal fixed colours regardless of
  row, only the body/wings take the row's own tint (boss red, mid
  yellow, drone cyan) so the three enemy roles stay visually distinct.
- Screen is 50% larger than the original size.
- `Arcade.sfx` wired up for sound (shared pass with lander, pacman).
- **Admin-configurable** at `/admin/games/?game=galaga`: `BSPEED` (player
  bullet speed), `ESPEED` (enemy speed), `BEAM_HOLD` (tractor beam open
  duration). Uses the site's generic numeric-knob config pattern (see
  kaboom's HANDOFF.md) — saved to `localStorage["galaga_config"]`,
  merged into `C` at boot via an explicit allowlist.

## Most recent pass

**Bug fix (found in a code-review pass, not player-reported): overlapping
divers could cost two lives for one collision.** A new dive can launch
every ~30 frames while a dive takes far longer than that to cross the
screen, so multiple divers are routinely in flight together — it's
normal, not an edge case, for two of them to both reach the player's
hitbox on the same tick. `step()`'s enemy loop decremented `s.lives`
directly for every colliding enemy with no per-frame guard, so that
ordinary overlap cost two (or more) lives for what reads as a single
hit. Added a `hitThisFrame` guard shared by the beam-capture and
dive-collision paths so at most one life is lost per frame.

Earlier: two player comments:

1. **"the enemies need to be chickens."** Replaced the plain recoloured
   rectangle with the chicken silhouette described above.
2. **"at the beginning when the enemy swoops in they need to be large
   slow sweeping swoops. When the enemy captures the hero, it needs to
   trigger a second ship like if the life was lost, then we get the ship
   back when we shoot it."** Two parts:
   - Swoop entrance eased further still (a follow-up to the previous
     pass below): duration 72→110 frames, midpoint pushed from 0.90/210
     to 0.96/280.
   - The capture-and-rescue mechanic already matched what was described
     (a life spent, play continues on a fresh single fighter, shooting
     the captor frees the ship into a dual-fighter) — what was actually
     missing was the `captureFlash` visible feedback beat above; the
     underlying state machine was untouched.

Earlier: **player feedback: "the swooping entrance should be a bigger
slower loop that goes past more of the screen."** `enterStep()`'s
quadratic-bezier entrance: duration up from 46 to 72 frames (~57%
slower), and the midpoint control coordinate pushed further across
(0.75→0.90 of the width) and deeper down (150→210). Worth remembering
for any future tune: a quadratic bezier does NOT pass through its own
midpoint coordinate at u=0.5 — the actual peak position it swings
through depends on where the enemy's start and final formation-slot
coordinates are too, so "does the loop cover more screen" needs
comparing against the old formula for the same start/end (see
`galaga-swoop-test.js` in the scratchpad for the pattern), not an
absolute on-screen threshold.

Earlier still: added the admin config pane described above — no
gameplay change to the defaults at that point.

Earlier still: sound effects wired up via `Arcade.sfx` (shared with
lander/pacman); swooping wave entrances (enemies fly into formation
instead of just appearing) plus a bomber-chicken flyby cameo; and before
that, the animated tractor-beam capture mechanic, dual-ship rescue, and
the 50% larger screen — the core gameplay-defining pass for this game.

## Open / deferred

Nothing currently open for this game.
