# Flappy Chicken (flappy) — per-game handoff

Flappy Bird-style tap-to-fly: thread the gaps between pipes without
touching one.

## What's here

- `index.html` — everything. `window.__flappy` exposes just `C` (the
  admin-tunable difficulty knobs below) — not a full pure-sim export,
  the update/render loop itself is still untested.
- Uses the shared "Press Spacebar to Begin" overlay gate.

## Most recent pass

Chicken-themed rebrand (name/imagery), shared with Whack-a-Chicken and
Chicken Run in the same pass. Original build: added alongside Word Guess
(Wordle), Doodle Jump, and Stack.

## Admin config

`/admin/games/?game=flappy` — 4 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `GAP` (pipe gap),
`SPEED` (scroll speed), `GRAV`, `FLAP` (flap strength). Pulled out of
a standalone `const` into a mutable `C` object; an IIFE reads
`localStorage.flappy_config` on load and overrides any matching
numeric key via an explicit allowlist. `PIPE_W` stays a plain const —
structural, not a difficulty knob.

## Open / deferred

Nothing currently open for this game.
