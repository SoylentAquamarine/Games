# Chicken Pinball (pinball) — per-game handoff

Pinball table: flippers, launch lane, bumpers.

## What's here

- `index.html` — everything. `window.__pinball` exposes the pure sim for
  headless testing.
- Table is 50% larger than its original size, with wider flippers and
  better ball containment (was escaping the table).
- **Flipper bounce boost is gated on the flipper actually being in
  motion, not just held up.** `flipperReflect(ball, seg, active)` is
  pure/unchanged — `active` just always applies `C.FLIP_IMPULSE` when
  true. What changed is what the caller passes: `f.swinging`, computed
  in `frame()`'s per-frame angle-easing step as "the angle still has a
  meaningful distance left to catch up to its target" (`Math.abs(delta)
  >0.15`, where `delta=target-f.angle`). A fresh press starts with a
  large delta (fast catch-up = swinging); a steady hold naturally settles
  toward 0 within a few frames (still = not swinging). Real per-frame
  values matter here — if the ease factor (currently `*0.4`) or the
  0.15 threshold ever change, "swinging lasts ~3-4 frames after a press"
  is the invariant to preserve, not the exact numbers.
- **Admin-configurable** at `/admin/games/?game=pinball`: `BUMP_BOOST`
  (bumper bounce strength), `FLIP_IMPULSE` (flipper strength). Uses the
  site's generic numeric-knob config pattern (see kaboom's HANDOFF.md) —
  saved to `localStorage["pinball_config"]`, merged into `C` at boot via
  an explicit allowlist. Table geometry and base gravity/damping are
  deliberately not exposed.

## Most recent pass

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier, two player comments:

1. **"paddles 10% longer"** — `FLEN` 50 → 55.
2. **"if i am holding the paddles up the ball should not bounce that
   high, bounce high only if i swing the paddle and connect with the
   ball while the paddle is in motion"** — see "What's here" above for
   the `f.swinging` mechanic that replaced the old `f.pressed &&
   Math.abs(f.angle-f.up)<0.5` check (true for the ENTIRE time a flipper
   was held up, not just while swinging).

Earlier: fixed a launch that could fail to clear the lane (ball getting
stuck at the top of the plunger lane) and added a spacebar table-bump
input. Earlier still: wider flippers and 50% larger table alongside a
ball-containment fix. Earlier still: addressed a round of player
comments together with digdug, wordle, and chutes.

## Open / deferred

Nothing currently open for this game.
