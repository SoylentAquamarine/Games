# Breakout — per-game handoff

Standard Breakout/Arkanoid clone: paddle, ball, brick grid, levels speed
up and re-rack on clear.

## What's here

- `index.html` — everything, structured as top-level closures (`paddle`,
  `ball`, `bricks`, `score`, `lives`, `level`, `dying`) rather than a single
  state object other games use — reset()/update()/render() operate on
  those directly. `window.__breakout` exposes `update`, `reset`, `C`
  (plus spread flat), `getBall`, `getLives`, `getDying`, `setBallY`
  for headless testing.
- This game had **no test scaffold at all** before the most recent pass —
  it was the one exception to the site-wide "every game exposes
  `window.__<name>`" convention. That gap is now closed.

## Most recent pass

**Bug**: "when missed there needs to be a pause instead of launching
instantly." The ball used to respawn and immediately start moving again
the instant it fell past the paddle — no time to reposition. Added a
`DEATH_FRAMES` (120, matching the site-wide 2s "room to breathe"
convention) freeze: ball velocity zeroes, position holds, a "BALL LOST"
overlay shows, then it respawns and play resumes.

## Admin config

`/admin/games/?game=breakout` — 3 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `LIVES`,
`DEATH_FRAMES`, `BALL_SPEED`. Pulled the previously-standalone
`DEATH_FRAMES` (plus two hardcoded velocity components) into a
mutable `C` object; an IIFE reads `localStorage.breakout_config` on
load and overrides any matching numeric key via an explicit
allowlist. `BALL_SPEED` drives both velocity axes — `vy` is derived
as a fixed ratio of it (`-C.BALL_SPEED*1.125`) rather than exposing a
second knob, preserving the exact original default speed/angle while
still making overall ball speed tunable with one number.
`window.__breakout` exports `C` both nested (`.C`) and spread flat
(`...C`).

## Open / deferred

Nothing currently open for this game.
