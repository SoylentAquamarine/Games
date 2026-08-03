# Doodle Chicken (doodlejump) — per-game handoff

Doodle Jump-style vertical platformer: bounce up an endless tower of
platforms, avoid falling off the bottom of the screen.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Level banner, sounds, 4:3 scale-up, and altitude bands (shared pass
  with `qbert` and `lander`).

## Most recent pass

Level banner + sounds + 4:3 scale-up + altitude bands, in a pass shared
with qbert and lander. Earlier: chicken-themed rebrand (name/imagery,
shared with seven other games in the same pass). Original build: added
alongside Flappy, Word Guess (Wordle), and Stack.

## Open / deferred

- **No `window.__doodlejump` test export** — worth adding if this game
  gets a future gameplay pass, to make headless regression testing
  possible (see any other game's HANDOFF for the pattern).
