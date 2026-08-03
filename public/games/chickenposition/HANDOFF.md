# Chicken Position (chickenposition) — per-game handoff

Pole Position-style pseudo-3D racer: bottom-up road projection, curves
that shift the rendered road, an offroad penalty.

## What's here

- `index.html` — everything. `window.__chickenposition` exposes the pure
  sim (`newState`, `step`, `curveAt`, `crash`, `computeRoadRows`, `C`).
- Built alongside `chicken1` (a separate top-down F1 racer) in the same
  original pass — the two share some driving-game history but are
  independent games/files.
- Road curvature accumulates from a single source (not compounded from
  multiple values) — a past bug let right-edge artifacts creep in when
  curve contributions were added from more than one place per frame.

## Most recent pass

Recalibrated the steering-shift dampener (0.24 → 0.9) so the rendered
road position actually matches the offroad collision threshold — before
this, small legitimate steering barely moved the drawn road, so "still
looks on the road" was true on screen while `playerX` had already
crossed the real offroad line underneath. Earlier in the same thread:
dampened how much steering shifts the road at all (was flinging it
off-screen at full lock), tightened the collision hitbox to match the
drawn car size, and fixed a single-curve-accumulation bug that caused
right-edge road artifacts.

## Open / deferred

Nothing currently open for this game.
