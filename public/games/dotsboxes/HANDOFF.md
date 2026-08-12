# Dots & Boxes (dotsboxes) — per-game handoff

Classic Dots & Boxes on a 5x5 dot grid by default (4x4 boxes) against a
CPU: draw an edge, complete the 4th side of a box to claim it and go
again.

## What's here

- `index.html` — everything, SVG-rendered board. `window.__db` exposes
  the pure sim (`newGame`, `applyEdge`, `boxSides`, `completesBox`,
  `sidesIfAdded`, `state`, `D`, `BOX`, `C`, spread flat too) for headless
  testing.
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
## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
Grid size (was a hardcoded `const D=5`) pulled into a `C={GRID_SIZE:5}`
object with the standard localStorage-override IIFE (`dotsboxes_config`,
allowlist: `GRID_SIZE`). Unlike Tetris/2048/Battleship's fixed board
dimensions, Dots and Boxes has no single canonical grid size across
implementations, so this is a genuine difficulty dial rather than a
rule-breaking change — a bigger grid means a longer, more strategic
game. `SP` (dot spacing) already computed dynamically from `D`, so
rendering scales correctly with no CSS/layout risk. Registered in
`/admin/games/`'s `NUMERIC_CONFIGS`. New `dotsboxes-config-test.js` (9
checks) verifies the default matches the original hardcoded 5 and that
an override (tested at 7) actually builds a correctly-sized grid.
Existing `dotsboxes-probe.js` (300 simulated games) and
`dotsboxes-orchestration-probe.js` (100 full games via real click
wiring) both still pass unaffected. Live-verified: deployed, confirmed
the default 5x5 board renders correctly, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
