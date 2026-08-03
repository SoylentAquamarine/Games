# Chixxon (chixxon) — per-game handoff

Zaxxon-style isometric flyer: altitude control with a ground shadow,
obstacles, staged bosses.

## What's here

- `index.html` — everything. `window.__chixxon` exposes the pure sim
  (`newState`, `step`, `spawnObstacle`, `spawnBoss`, `nextStage`, `hit`,
  `respawn`, `screenY`, `mkSplash`, `C`).
- Altitude is tracked separately from screen position, with a ground
  shadow sprite (`mkSplash`) showing where you'd land — the core Zaxxon
  mechanic of judging height against obstacles by watching the shadow,
  not the sprite itself.

## Most recent pass

Original implementation — added as a new game (Zaxxon clone with
altitude/shadow flying). No follow-up passes yet.

## Open / deferred

Nothing currently open for this game — hasn't had a player-feedback pass
yet.
