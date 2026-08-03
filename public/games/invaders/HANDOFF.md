# Chicken Invaders (invaders) — per-game handoff

Space Invaders-style shooter: a descending flock, barricades, an
occasional rooster UFO worth bonus points.

## What's here

- `index.html` — everything. `window.__invaders` exposes a state snapshot
  (`state:()=>({pBullet,keys,ufo,ufoDone,score,wave,lives,running,dying,
  levelCard,...})`) for headless testing.
- Death animation, a wave title card, and resuming from the same board
  layout after a death (not a full reset).
- Fast bullets are swept against barricades so they can't tunnel through
  in a single frame at high speed.

## Most recent pass

Death animation + wave card + same-board resume added as one pass. Two
real bugs fixed just before that: killing the rooster UFO could freeze
the game, and holding fire down across a flock-thinning speedup used to
stop registering — both are the class of bug where a fast state
transition (rooster death, speed change) left some piece of per-frame
state in an invalid combination the update loop didn't handle. Also:
rarer rooster spawn rate and a flock-thinning speedup shared with
Centipede's pass.

## Open / deferred

Nothing currently open for this game.
