# Lander — per-game handoff

Lunar-lander-style game: thrust/steer a chicken-piloted lander onto one of
three risk/reward pads (Valley 1x, Ridge 2x, Peak 3x) scattered across a
freshly generated jagged terrain each round.

## What's here

- `index.html` — physics + terrain generation + rendering.
  `window.__lander` exposes the pure sim (`makeState`, `step`, `nextRound`,
  `buildTerrain`, `spawnFlyby`, `landThresholds`, `C` constants) for
  headless testing.
- Terrain: `buildTerrain()` carves 3 flat pads (one per horizontal third of
  the screen, at increasing elevation/risk) into otherwise jagged
  sine-noise mountains. `terrainYAt()` interpolates ground height between
  sampled points.

## Most recent pass

**Player feedback: "need to use fuel at half the rate, also decrease
gravity by 30%."** Burn rates halved (`BURN_UP` 0.32→0.16, `BURN_SIDE`
0.18→0.09 — these were themselves already eased ~35% from an original
0.5/0.28 in an earlier pass), and `GRAVITY` cut 30% (0.0648→0.04536).
Pure constant tuning, no logic changes.

Earlier pass, three parts:

1. Landing speed thresholds now scale with the pad's payout multiplier
   (`landThresholds(mult)`) instead of one flat `LAND_VMAX`/`LAND_VXMAX`
   for every pad — Valley (1x) is forgiving, Peak (3x) demands a
   genuinely gentle touch. The HUD's speed-warning colour now checks
   whichever pad is currently underneath the ship (falls back to the 1x
   threshold over open terrain).
2. Fuel no longer resets on every round transition or crash-respawn — it
   persists as a real cross-round resource (`respawnShip` no longer
   touches `s.fuel` at all).
3. Every `FLYBY_EVERY` (5) rounds, the same transition that spawns the
   decorative flyby cameo now also refuels the tank to full
   (`s.justRefueled`, one-shot flag consumed by the DOM layer for its own
   sound/message) — the flyby sprite crossing the sky doubles as the
   "refuel animation" that was asked for.

Earlier pass: reworked the game loop so a good landing advances to a new
round (`nextRound()`, `C.LAND_FRAMES` freeze) instead of ending the run
outright, added a bonus chicken every few rounds (capped at
`C.MAX_LIVES`), and the flyby cameo itself. Non-obvious detail carried
over from that pass: the bonus-chicken/flyby checks run on the round
number *after* `s.round++`, so they fire on landing #2/#5/#8 (arriving on
round 3/6/9), not landing #3/#6/#9 — still an "every 3rd/5th landing"
cadence, just anchored to the round you land into.

## Open / deferred

Nothing currently open for this game.
