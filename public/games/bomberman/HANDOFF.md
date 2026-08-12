# Chicken Bomber (bomberman) — per-game handoff

Bomberman-style grid bomber: place bombs, clear destructible blocks,
avoid enemies and your own blast radius.

## What's here

- `index.html` — everything. `window.__bomberman` exposes the pure sim
  for headless testing.
- `Arcade.sfx` wired up for sound effects (shared pass with frogger,
  digdug, drmario).
- **Admin-configurable** at `/admin/games/?game=bomberman`: `BOMB_TIME`
  (fuse time), `range` (blast range in tiles), `BLAST_LIFE` (blast
  visual duration). Uses the site's generic numeric-knob config pattern
  (see kaboom's HANDOFF.md) — saved to `localStorage["bomberman_config"]`,
  merged into `C` at boot via an explicit allowlist.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Explained `explodeCells()`'s cross-shaped blast (wall blocks entirely,
brick stops the blast but is still destroyed), `detonate()`'s chain-
reaction mechanic (a caught bomb's timer is forced to 0, not detonated
immediately — it cascades one tick at a time through `tick()`'s own
loop), and `moveEnemies()`'s 70%-continue wander AI. Comment-only — no
logic touched. Live-verified: deployed, zero console errors.

## Earlier pass — admin config

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier passes: sound effects wired up via the shared `Arcade.sfx`
helper; scaling, feedback color, egg-drop, and dragon-spacing fixes
shared with several other games in the same pass. Original build: added
alongside Dig Dug.

## Open / deferred

Nothing currently open for this game.
