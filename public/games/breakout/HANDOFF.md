# Breakout — per-game handoff

Standard Breakout/Arkanoid clone: paddle, ball, brick grid, levels speed
up and re-rack on clear.

## What's here

- `index.html` — everything, structured as top-level closures (`paddle`,
  `ball`, `bricks`, `score`, `lives`, `level`, `dying`, `stuck`) rather than
  a single state object other games use — reset()/update()/render()
  operate on those directly. `window.__breakout` exposes `update`,
  `reset`, `launchBall`, `C` (plus spread flat), `getBall`, `getLives`,
  `getDying`, `getStuck`, `getLevel`, `setBallY` for headless testing.
- This game had **no test scaffold at all** before an earlier pass — it
  was the one exception to the site-wide "every game exposes
  `window.__<name>`" convention. That gap is now closed.
- **A respawned or new-level ball sticks to the paddle until launched.**
  `stuck` (bool) gates `update()`'s ball physics — while stuck the ball
  just tracks the paddle's x position and sits just above it; nothing
  moves or can die. `launchBall()` (Space press, or a tap/click on the
  canvas) is the only thing that clears `stuck` and gives the ball its
  velocity. The very first ball of a run (clicking "Play") is the one
  exception — it still serves immediately, since clicking Play is
  itself the deliberate launch action.
- **Launch speed scales with the current level** (`C.BALL_SPEED *
  1.06^(level-1)`), replacing an earlier flat one-time 1.06x bump that
  used to run immediately after `reset()` — see "Most recent pass".

## Most recent pass — sticky ball

**Player feedback (follow-up): "after i lose a ball and have to go
again the ball should be sticky and i have to hit the space bar to
launch it so I am not thrown into the next level so quickly, do it
after deaths and after levels."** Both a death-respawn and a
level-clear used to hand the player a ball already in motion the
instant it appeared. Both paths now leave the ball `stuck` (see "What's
here") instead, with a "Press SPACE or tap to launch" prompt drawn
above the paddle. Found and fixed a related bit of now-dead code while
in the area: the level-clear call site used to multiply the fresh
ball's velocity by 1.06 immediately after `reset()` — since that ball
now starts at zero velocity (stuck), the multiply was doing nothing
(0×1.06=0). Moved the same "later levels are faster" intent into
`launchBall()` itself, computed from the current `level` number
(`C.BALL_SPEED*Math.pow(1.06,level-1)`) — this is also a genuine
improvement over the old behavior, which reset to the flat base speed
on every level and so never actually compounded across multiple
level-clears despite reading like it should have.

Existing `breakout-death-pause-test.js` needed updates for the
deliberately changed respawn behavior (a respawned ball is now stuck,
not already moving — 3 checks reworked, plus a new one covering
`reset(false)`'s level-clear path). Added
`breakout-sticky-ball-test.js` (10 checks) covering the initial-ball
exception, `launchBall()`'s no-op-when-already-live guard, the stuck
ball tracking the paddle position, and the level-speed-scaling formula
specifically. All pass. Live-verified: deployed, drove
`reset(true)`→`reset(false)`→`launchBall()` through the real exported
API and confirmed each transition matches (live→stuck→launched), zero
console errors.

## Earlier pass

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
