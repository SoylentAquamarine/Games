# Maze (maze) — per-game handoff

Procedural maze runner: navigate from the top-left to the bottom-right
exit through a freshly generated maze, with 3 selectable sizes.

## What's here

- `index.html` — everything, canvas-based. `window.__maze` exposes
  `setN`, `genTest`, `N` for headless testing.
- Maze generation (`gen`) is a randomized depth-first backtracker over a
  grid of cells each tracking their 4 walls (`n`/`e`/`s`/`w`) — a classic
  "recursive backtracker" carving algorithm, which guarantees exactly one
  path between any two cells (a perfect maze, no loops).
- 3 sizes (Easy 10x10, Medium 16x16, Hard 24x24), switching size rebuilds
  and regenerates immediately.
- Controls: arrow keys/WASD, on-screen d-pad buttons, and swipe gestures
  (`touchstart`/`touchend` delta) all call the same `move(dir)` function.
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
`gen()` had zero comments despite being a named, well-known algorithm
(randomized DFS "recursive backtracker" maze generation) that isn't
obviously that from the code alone — added an explanation of the
stack-based visit/knock-down-a-wall/backtrack process and why it
guarantees a "perfect" maze (every cell reachable, exactly one path
between any two, no loops). Comment-only — no logic touched. Live-
verified: deployed, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
