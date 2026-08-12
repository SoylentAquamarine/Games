# Doodle Chicken (doodlejump) — per-game handoff

Doodle Jump-style vertical platformer: bounce up an endless tower of
platforms, avoid falling off the bottom of the screen.

## What's here

- `index.html` — everything. `window.__doodlejump` exposes just `C`
  (the admin-tunable difficulty knobs below) — not a full pure-sim
  export, the update/render loop itself is still untested.
- Level banner, sounds, 4:3 scale-up, and altitude bands (shared pass
  with `qbert` and `lander`).

## Most recent pass

Level banner + sounds + 4:3 scale-up + altitude bands, in a pass shared
with qbert and lander. Earlier: chicken-themed rebrand (name/imagery,
shared with seven other games in the same pass). Original build: added
alongside Flappy, Word Guess (Wordle), and Stack.

## Admin config

`/admin/games/?game=doodlejump` — 3 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `GRAV`, `JUMP`
(bounce strength), `MOVE` (left/right speed). Pulled out of a
standalone `const` into a mutable `C` object; an IIFE reads
`localStorage.doodlejump_config` on load and overrides any matching
numeric key via an explicit allowlist. `PW`/`PH` (platform size) stay
plain consts — structural, not a difficulty knob.

## Open / deferred

Nothing currently open for this game.
