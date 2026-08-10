# Sokoban (sokoban) — per-game handoff

Classic box-pushing puzzle: push every box 📦 onto a target ⭐ across 4
hand-authored levels, with undo and per-move history.

## What's here

- `index.html` — everything. `window.__soko` exposes `LEVELS`,
  `DEFAULT_LEVELS`, `isValidLevels`, `loadTest`, `moveTest` for headless
  testing.
- Levels are hand-authored ASCII maps (`#`=wall, `.`=target, `$`=box,
  `*`=box-on-target, `@`=player, `+`=player-on-target), parsed into
  `walls`/`targets`/`boxes` sets plus a `player` position (`parse`).
- Full undo support: every move pushes a snapshot (`{p, b, m}` — player
  position, box set, move count) onto `undoStack` before applying, and
  ↶ Undo pops the last one back.
- Movement (`move`) only pushes a box if the square beyond it is both
  in-bounds-of-walls and unoccupied by another box — the player can push
  but never pull.
- Solving a level auto-advances to the next after a short delay
  (`setTimeout(...,1100)`); solving the last level shows an "All levels
  complete" message instead.
- **Admin-configurable** at `/admin/games/?game=sokoban`: a real
  per-level board editor, part of the site's board/level-editor
  rollout (see kaboom's/quest's HANDOFF.md for the general pattern).
  `LEVELS` is overridable via `localStorage["sokoban_levels"]`
  (`isValidLevels` gates it, safe fallback to `DEFAULT_LEVELS` on
  anything malformed) — the level count is no longer fixed at 4, the
  editor can add or delete levels freely.

## Most recent pass

**Board/level editor rollout: sokoban was the next candidate** (flagged
in root `HANDOFF.md` as the cheapest — already had a fixed `LEVELS`
array, the same shape quest/minigolf's editors expect). Added a
paint-tool canvas in the admin panel (7 brushes: wall/floor/target/box/
box+target/player/player+target) over a fixed 10x8 edit grid, a level
picker with add/delete, and save/test/reset — same conventions as
quest's dungeon-room painter and mini golf's hole editor. The 4
built-in levels are preserved exactly (padded out to the fixed edit
grid by extending their wall border, not by resizing the playable
area) so nothing about the existing levels changed, only that they're
now editable and more can be added.

Earlier: no player-feedback pass yet — this HANDOFF.md was created as part
of a documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflected the game as
originally built.

## Open / deferred

Nothing currently open for this game.
