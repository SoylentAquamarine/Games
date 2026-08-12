# Flood It (floodit) — per-game handoff

Flood-fill puzzle: pick a color to flood outward from the top-left corner,
fill the entire 14x14 board with one color before running out of moves.

## What's here

- `index.html` — everything. `window.__flood` exposes the pure sim
  (`region`, `pickTest`, `won`, `SIZE`, `NC`) for headless testing.
- 14x14 board (`SIZE`), 6 colors (`NC`), move cap (`C.MAXMOVES`,
  default 25).
- `region()` is a flood-fill (stack-based DFS) from the top-left cell that
  finds every same-colored cell connected to it; picking a palette color
  recolors that whole connected region in one move (`pick`).
- A "coverage" readout (`coverage()`) shows the flooded percentage when
  the player runs out of moves without fully filling the board.
- **Admin-configurable** at `/admin/games/?game=floodit`: `MAXMOVES`.
  Uses the site's generic numeric-knob config pattern (see kaboom's
  HANDOFF.md) — saved to `localStorage["floodit_config"]`, merged into
  `C` at boot via an explicit allowlist. `SIZE`/`NC` stay fixed — `NC`
  is capped by `COLORS.length` (6 hex strings), not a plain scalar that
  can just scale up.

## Most recent pass

Added the admin config pane described above (`MAXMOVES`) — no
gameplay change to the default.

Earlier: no player-feedback pass yet — this HANDOFF.md was created as
part of a documentation sweep (see the root HANDOFF.md's "Per-game
HANDOFF.md rollout" note). Everything under "What's here" reflects the
game as originally built.

## Open / deferred

Nothing currently open for this game.
