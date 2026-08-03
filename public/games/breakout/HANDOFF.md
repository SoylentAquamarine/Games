# Breakout — per-game handoff

Standard Breakout/Arkanoid clone: paddle, ball, brick grid, levels speed
up and re-rack on clear.

## What's here

- `index.html` — everything, structured as top-level closures (`paddle`,
  `ball`, `bricks`, `score`, `lives`, `level`, `dying`) rather than a single
  state object other games use — reset()/update()/render() operate on
  those directly. `window.__breakout` exposes `update`, `reset`,
  `DEATH_FRAMES`, `getBall`, `getLives`, `getDying`, `setBallY` for
  headless testing.
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

## Open / deferred

Nothing currently open for this game.
