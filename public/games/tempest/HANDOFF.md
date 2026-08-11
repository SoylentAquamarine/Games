# Chicken Tempest (tempest) — per-game handoff

Tempest clone: a 16-lane vector "tube" (the well) radiating out from a
center hub. The player rides the outer rim and can move left/right around
it; foxes climb up the lanes from the hub toward the rim, and once they
reach it they hop along adjacent lanes trying to reach the player's lane.

## What's here

- `index.html` — everything, cleanly split into a pure sim and a thin DOM
  layer. `window.__tempest` exposes the entire sim: `newGame`, `nextWave`,
  `moveLane`, `fire`, `stepShots`, `spawnEnemies`, `stepEnemies`,
  `resolveHits`, `zap`, `waveClear`, `die`, plus the geometry helpers
  (`laneAngle`, `laneRim`, `laneWorldXY`, `laneDist`, `laneStepToward`,
  `waveShape`, `enemyCountFor`, `enemySpeedFor`) and constants
  (`LANES`, `CENTER`, `RIM_R`/`RIM_R_IN`, `MOVE_EVERY`, `SHOT_SPEED`,
  `HOP_EVERY`, `HIT_EPS`, `SPAWN_GAP`, `SUPERZAPS_PER_WAVE`).
- **Lane coordinate system**: every lane is parameterized by `t` from 0
  (the hub, center of screen) to 1 (the rim). Shots start near the rim
  (`SHOT_START≈0.94`) and travel inward (`t` decreases); foxes spawn at
  the hub (`t=0`) and climb outward (`t` increases) until `t>=1`, at
  which point `atRim` flips true and they switch to hopping laterally
  along the rim every `HOP_EVERY` frames, mostly toward the player's lane
  (`laneStepToward` picks the shorter way around) with a little
  randomness so they aren't perfectly predictable.
- **Two tube shapes**, alternating by wave (`waveShape`): odd waves are a
  plain circle (`RIM_R` for every lane); even waves are an 8-point star
  (`RIM_R`/`RIM_R_IN` alternating by lane parity) — a real shape change,
  not just a palette swap, matching the arcade original's varying well
  geometry.
- **Superzapper**: `SUPERZAPS_PER_WAVE=1`, refilled every `nextWave()`.
  Clears every enemy currently on the tube (not the remaining spawn
  queue) and scores 50 per enemy cleared — a panic button, not a
  score-farming tool (it's free but limited, and does nothing on an
  already-empty tube so it can't be wasted for no reason).
- Difficulty ramps via `enemyCountFor(wave)` (spawn quota per wave, capped
  at 14) and `enemySpeedFor(wave)` (climb speed, capped) — both simple
  monotonic functions, no per-wave special-casing needed.
- Standard site conventions: `/arcade.js` for `Arcade.sfx`/`Arcade.stats`,
  `/startgate.js` for the "press Space to begin" overlay prompt,
  `/comments.js` + `/fullscreen.js` at the bottom, `tempest_best` in
  localStorage, on-screen d-pad + Zap button for touch.

## Design notes / deliberate scope decisions

- **No mascot flyby cameo** (unlike most other arcade games on the site):
  the site-wide spacesuit-chicken flyby reads as a flat sprite crossing a
  2D sky, which doesn't fit this game's radial vector-tube perspective —
  skipped rather than forced in awkwardly. Worth revisiting if a
  tube-appropriate cameo idea comes up (e.g., a rim-hugging flypast).
- Lane movement is discrete (snap to one of 16 lanes, `MOVE_EVERY=6`
  frames per step while held) rather than free continuous rotation —
  matches the original's spinner-driven but still lane-locked movement,
  and keeps collision/hit detection exact (lane equality, no radius
  math needed).
- Death has no debris/wreckage animation (unlike Asteroids/Chickenmania) —
  just a brief red flash and a short invulnerability window on respawn.
  Kept simple since the tube's own foxes keep advancing during a longer
  death pause would need extra state; a future pass could add a proper
  death freeze if it reads as too abrupt.

## Open / deferred

Nothing reported yet — this is a new game, added from the "1978-88 arcade
shortlist" home-page pick ("Build Tempest now" + later narrowed to
Tempest, Defender, Robotron: 2084, Elevator Action, Burgertime).
