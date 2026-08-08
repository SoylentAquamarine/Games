# Sokoban (sokoban) — per-game handoff

Classic box-pushing puzzle: push every box 📦 onto a target ⭐ across 4
hand-authored levels, with undo and per-move history.

## What's here

- `index.html` — everything. `window.__soko` exposes `LEVELS`,
  `loadTest`, `moveTest` for headless testing.
- 4 levels (`LEVELS`) are hand-authored ASCII maps (`#`=wall, `.`=target,
  `$`=box, `*`=box-on-target, `@`=player, `+`=player-on-target), parsed
  into `walls`/`targets`/`boxes` sets plus a `player` position (`parse`).
- Full undo support: every move pushes a snapshot (`{p, b, m}` — player
  position, box set, move count) onto `undoStack` before applying, and
  ↶ Undo pops the last one back.
- Movement (`move`) only pushes a box if the square beyond it is both
  in-bounds-of-walls and unoccupied by another box — the player can push
  but never pull.
- Solving a level auto-advances to the next after a short delay
  (`setTimeout(...,1100)`); solving the last level shows an "All levels
  complete" message instead.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Only 4 levels exist (`LEVELS.length===4`) — the level count is a fixed,
hardcoded array rather than a generator or expandable set. Not
necessarily a TODO, just worth noting if more levels are ever wanted.
