# Chicken Joust (joust) — per-game handoff

Joust-style flying-lance combat on floating platforms: flap to gain
altitude, joust higher than the enemy to win the collision.

## What's here

- `index.html` — everything. `window.__joust` exposes the pure sim
  (`newState`, `step`, `physics`, `joustResult`, `makeWave`, `moveEnemy`,
  `spawnOnNest`, `die`, `PLATS`, `C`).
- The board wraps horizontally — flying off one edge brings you back on
  the other side. There is no "touches the wall" invariant to preserve;
  that was a stale test assumption fixed in an earlier bug-hunt pass, not
  a game rule.
- Enemies patrol left/right along platforms rather than homing in on the
  player; a nest respawn plays a hatch animation with a brief safe
  no-hit window afterward.

## Most recent pass

Scaled everything up: hero + enemy sprites doubled (2x), 10% less
gravity to keep the larger sprites feeling right at the new scale.
Earlier: the whole screen/board scaled 50%/25% bigger; enemy AI changed
from homing to left/right patrol, plus the nest-hatch respawn animation
and its safe window.

## Open / deferred

Nothing currently open for this game.
