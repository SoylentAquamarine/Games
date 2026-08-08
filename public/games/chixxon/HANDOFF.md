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
- **Admin-configurable** at `/admin/games/?game=chixxon`: `LIVES`, `HP`
  (hits before a life is lost), `SCROLL_BASE`, `SPAWN_GAP_BASE`, `BOSS_HP`.
  Uses the site's generic numeric-knob config pattern (see kaboom's
  HANDOFF.md) — saved to `localStorage["chixxon_config"]`, merged into `C`
  at boot via an explicit allowlist.

## Most recent pass

Added admin-configurable difficulty knobs (see above) as part of the
site-wide numeric-knob config rollout — no player feedback prompted this,
just extending an existing pattern to a game that already had a suitable
`C` object.

Earlier: original implementation — added as a new game (Zaxxon clone with
altitude/shadow flying).

## Open / deferred

Nothing currently open for this game — hasn't had a player-feedback pass
yet.
