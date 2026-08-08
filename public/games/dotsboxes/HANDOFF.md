# Dots & Boxes (dotsboxes) — per-game handoff

Classic Dots & Boxes on a 5x5 dot grid (4x4 boxes) against a CPU: draw an
edge, complete the 4th side of a box to claim it and go again.

## What's here

- `index.html` — everything, SVG-rendered board. `window.__db` exposes
  the pure sim (`newGame`, `applyEdge`, `boxSides`, `completesBox`,
  `sidesIfAdded`, `state`) for headless testing.
- Edges are tracked as two separate grids, `h` (horizontal edges) and `v`
  (vertical edges); completed boxes are tracked in a `boxes` grid holding
  the claiming player's number. Claiming a box grants an extra turn
  (`made>0` keeps `turn` unchanged).
- CPU strategy (`cpuTurn`): first takes any edge that completes a box
  (repeating while it can chain box completions); otherwise picks a
  random "safe" edge that wouldn't hand the human a free 3rd side
  (`sidesIfAdded(...)<3`); if no safe edge exists, it's forced to sort by
  `opens()` (how many boxes it would open up) and pick the least-bad one.
- Each undrawn edge line has an invisible wide hit-target (`stroke-width:
  18`, class `hit`) layered under the thin visible line, making edges
  easier to tap than the rendered line width suggests.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
