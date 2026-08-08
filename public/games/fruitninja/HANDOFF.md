# Fruit Slice (fruitninja) — per-game handoff

Fruit Ninja-style slicer: drag across launched fruit to slice it for
points, avoid slicing bombs, don't let fruit fall uncaught.

## What's here

- `index.html` — everything, canvas-based. `window.__fruitninja` exposes
  the pure sim (`newState`, `step`, `sliceSegment`, `segHitsFruit`,
  `segDist`, `spawn`, `C`) for headless testing.
- Uses the shared `/arcade.js` `Arcade.startGate` (press-to-begin gate)
  and `Arcade.stats.record("fruitninja", s.score)`.
- Slicing is segment-based: every pointer-move draws a line segment from
  the last point to the current point, and `sliceSegment` hit-tests that
  segment against every live fruit's radius via point-to-segment distance
  (`segDist`), so fast swipes reliably catch fruit even between animation
  frames.
- 14% of spawns are bombs (`Math.random()<0.14`); slicing one ends the run
  immediately. Fruit not sliced in time falls past the bottom, costing a
  life (3 lives, `C.LIVES`) unless it was a bomb (bombs falling off-screen
  are harmless).
- Sliced fruit splits into two half-circles that fade out over ~14 frames
  rather than just disappearing.
- Best score persisted to `localStorage["fruit_best"]`. No admin config
  pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
