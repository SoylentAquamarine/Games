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

## Admin config

`/admin/games/?game=invaders` — 3 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `LIVES`,
`DEATH_FRAMES`, `CARD_FRAMES`. This was the first game retrofitted
with no pre-existing `C` object — one was added (`const C={LIVES:3,
DEATH_FRAMES:60, CARD_FRAMES:90}`) alongside an IIFE that reads
`localStorage.invaders_config` on load and overrides any matching
numeric key via an explicit allowlist. `window.__invaders` exports
`C` alongside its existing state-snapshot closure, same pattern as
every other configurable game (e.g. kaboom).

## Open / deferred

Nothing currently open for this game.
