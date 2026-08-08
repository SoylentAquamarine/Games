# Flood It (floodit) — per-game handoff

Flood-fill puzzle: pick a color to flood outward from the top-left corner,
fill the entire 14x14 board with one color before running out of moves.

## What's here

- `index.html` — everything. `window.__flood` exposes the pure sim
  (`region`, `pickTest`, `won`, `SIZE`, `NC`) for headless testing.
- 14x14 board (`SIZE`), 6 colors (`NC`), 25-move cap (`MAXMOVES`).
- `region()` is a flood-fill (stack-based DFS) from the top-left cell that
  finds every same-colored cell connected to it; picking a palette color
  recolors that whole connected region in one move (`pick`).
- A "coverage" readout (`coverage()`) shows the flooded percentage when
  the player runs out of moves without fully filling the board.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
