# Chicken Galaga (galaga) — per-game handoff

Galaga-style formation shooter: enemies swoop into formation, a tractor
beam can capture your ship (rescuable for a dual-ship power-up).

## What's here

- `index.html` — everything. `window.__galaga` exposes the pure sim for
  headless testing.
- Animated tractor beam that must actually be flown into to trigger a
  capture (not just proximity) — capturing and then rescuing your ship
  grants a dual-ship. A capture spends a life; the new ship doesn't
  actually spawn (and can't be hit) until the old one finishes climbing
  the beam (`s.respawning`, see "Most recent pass"), then continues play
  on a fresh, recentred single fighter, with a brief non-blocking
  `s.captureFlash` "SHIP CAPTURED!" beat so the loss is visible, matching
  the life-loss convention used elsewhere on the site.
- Dive frequency ramps in gently via `diveTimerFor(wave)` — wave 1 starts
  sparse (mostly formation, one diver at a time) and gets steadily more
  frequent, reaching its floor (fastest possible dive cadence) around
  wave 12.
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

**Three player comments, addressed together:**

1. **"no when the chickens swoop in at the beginning it needs to take
   4x as long for them to swoop in and the path they take needs to
   cover a LOT more of the screen, they need to sweep down to almost
   even with the hero, every time you fix the swoop it is almost
   exactly the same you have to really fix the swoop."** Duration
   110 → 440 frames (exactly 4x). The depth needed real math this
   time, not another parameter nudge: this is a quadratic bezier, and
   since BOTH the start point and the formation-row end point sit
   near the top of the screen, the curve's actual visual peak lands
   at roughly `0.25*start + 0.5*mid + 0.25*end` — nowhere near the
   `mid` control point itself. The prior pass's own caveat about this
   (see further down) was documented but not actually solved for —
   setting `midY` to the naive "almost even with the hero" value
   (~500) only produced a peak around y=276, barely past the previous
   pass's 280, which is very likely why it kept reading as
   unchanged. `midY=990` (off-canvas, as a bezier CONTROL point
   rather than a point the enemy visits) is what's actually needed to
   pull the visible peak to ~520, genuinely close to the player's row
   (`C.PLY=558`).
2. **"the chickens breaking off and diving, the first level is where
   the 10th level should be at. At first most chickens should stay
   in formation with a single chicken divebombing at a time. As
   difficulty increases they should dive more and more."** New
   `diveTimerFor(wave)` replaces the old `90-wave*8` (floor 30 by
   wave 8) with `350-(wave-1)*30` (floor 30 by wave ~12) — wave 1 now
   starts as sparse as the old formula's wave 1 used to be, shifted
   about 10 waves later.
3. **"when the chicken comes down and starts the capture ray, the
   animation for the capture ray should be slower, and once captured
   the screen should not have a hero until the captured hero is at
   the top and a new hero can start with the same animation as if
   the hero died."** `BEAM_RAMP` (cone open/shut speed) roughly
   doubled (26→50) and the boss's descent into beam position slowed
   to half speed (new `BOSS_DESCENT` factor). The new ship no longer
   spawns at the instant of capture — `s.respawning` defers `px`'s
   recentre and `captureFlash` until `s.pull` (the old ship's climb
   up the beam) actually finishes, and `draw()` hides the ship
   entirely while respawning so the old and new ships are never both
   visible at once. Collision checks against diving enemies and
   bomber bombs are also gated on `!respawning`.

Earlier: **bug fix (found in a code-review pass, not player-reported): overlapping
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
