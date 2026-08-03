# Chicken Dug (digdug) — per-game handoff

Dig Dug-style tunneler: dig through dirt, pop enemies with the pump, dodge
falling rocks.

## What's here

- `index.html` — everything. `window.__digdug` exposes the pure sim for
  headless testing.
- 4:3 board scale (shared pass with Chickenpede/ChickenBert).
- `Arcade.sfx` wired up for sound effects (shared pass with frogger,
  drmario, bomberman).

## Most recent pass

Sound effects wired up via the shared `Arcade.sfx` helper. Earlier:
smoother movement and more stable enemy patterns (shared fix with
chickenmania); rocks used to fall unprompted — fixed alongside a minigolf
ball-escaping-the-green bug in the same pass.

## Open / deferred

Nothing currently open for this game.
