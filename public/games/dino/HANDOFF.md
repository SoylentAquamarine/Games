# Chicken Run (dino) — per-game handoff

Chrome-dino-style endless runner: jump/duck obstacles at increasing speed.

## What's here

- `index.html` — everything. `window.__dino` exposes the pure sim for
  headless testing.
- Three distinct obstacle classes (added alongside Missile Command's
  launcher-damage feature in the same pass).
- Scaled down 20% from its original size in an earlier pass.
- **Admin-configurable** at `/admin/games/?game=dino`: `START` (starting
  speed), `MAX` (speed cap). Uses the site's generic numeric-knob config
  pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["dino_config"]`, merged into `C` at boot via an explicit
  allowlist. `GRAVITY`/`JUMP_V` (jump feel) are deliberately not exposed.

## Most recent pass

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier: added a third obstacle class (was likely two — low/high) in the
same pass that added launcher damage to Missile Command. Earlier still:
scaled the whole game down 20% for better fit. Original build: added
alongside Kaboom!, Duck Hunt, Piano Tiles, and Fruit Slice in one batch.

## Open / deferred

Nothing currently open for this game — hasn't had a dedicated
player-feedback pass yet.
