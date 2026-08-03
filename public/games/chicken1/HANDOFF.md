# Chicken1 (chicken1) — per-game handoff

Top-down F1-style racer: a curving road, forward scroll, traffic culling.

## What's here

- `index.html` — everything. `window.__chicken1` exposes the pure sim for
  headless testing.
- Built alongside `chickenposition` (a separate pseudo-3D Pole
  Position-style racer) in the same original pass — the two share driving-
  game history but are independent games/files. See `chickenposition`'s
  HANDOFF for its own steering/curve fixes.
- Reworked from a lives-based game into a time trial: no chickens/lives,
  race to a finish line instead.

## Most recent pass

Reworked into the time-trial format (no chickens/lives, race to a finish
line) in the same pass that fixed a canvas/coordinate-system mismatch
causing edge artifacts — that fix applied to both this game and
`chickenposition` since they share the underlying road-rendering
approach. Earlier: curving road, correct forward scroll, and traffic
culling (`fix(driving): chicken1 gets a curving road...`).

## Open / deferred

Nothing currently open for this game.
