# Lander — per-game handoff

Lunar-lander-style game: thrust/steer a chicken-piloted lander onto one of
three risk/reward pads (Valley 1x, Ridge 2x, Peak 3x) scattered across a
freshly generated jagged terrain each round.

## What's here

- `index.html` — physics + terrain generation + rendering.
  `window.__lander` exposes the pure sim (`makeState`, `step`, `nextRound`,
  `buildTerrain`, `spawnFlyby`, `C` constants) for headless testing.
- Terrain: `buildTerrain()` carves 3 flat pads (one per horizontal third of
  the screen, at increasing elevation/risk) into otherwise jagged
  sine-noise mountains. `terrainYAt()` interpolates ground height between
  sampled points.

## Most recent pass

Reworked the game loop per player feedback: a good landing used to end
the run outright ("Press New Game"). Now it freezes briefly on the pad
(`C.LAND_FRAMES`), then `nextRound()` loads a fresh terrain and respawns
the ship with a full tank — round number and total score carry forward.
Added a bonus chicken (life) every few rounds, capped at `C.MAX_LIVES`,
and a purely decorative flyby cameo every `C.FLYBY_EVERY` rounds (same
site-wide cameo pattern as Chicken Hunt). Crash/game-over mechanics are
unchanged: you still start with 3 chickens and the run ends when you're
out of them.

Non-obvious detail: the bonus-chicken/flyby checks run on the round
number *after* `s.round++`, so they fire on landing #2/#5/#8 (arriving on
round 3/6/9) rather than landing #3/#6/#9 — still an "every 3rd landing"
cadence, just anchored to the round you land into. See the regression
test for the exact numbers if this needs adjusting.

## Open / deferred

Nothing currently open for this game.
