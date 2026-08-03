# Chicken Command (missilecommand) — per-game handoff

Missile Command-style city defense: intercept incoming missiles before
they land, keep your cities standing.

## What's here

- `index.html` — everything. `window.__mc` exposes the pure sim
  (`newGame`, `startWave`, `spawnEnemy`, `spawnChicken`, `stepEnemy`,
  `fire`, `stepExplosion`, `explosionHits`, `cityIndexAtX`, `tick`,
  `stepFlyby`, `recover`, `dist`, `C`).
- Every 5th wave is a pure chicken raid — `s.flyers` holds however many
  spacesuit chickens are on screen at once (capped at 2 concurrently so
  the wave stays keepable), each drawn via the shared `/mascots.js`
  library (`Mascots.spacesuitChickenFlying`, looped over `s.flyers` since
  this is the one game with multiple simultaneous cameo sprites at once).
- Gentler overall difficulty curve than a first pass, with a
  post-wave recovery beat (`recover`).
- **Admin-configurable** at `/admin/games/?game=missilecommand`:
  `BASE_AMMO`, `ENEMY_SPEED`, `INTERMISSION`, `RECOVER_EVERY`,
  `FLYBY_EVERY`, `MAX_RAID_BOMBS`. Uses the site's generic numeric-knob
  config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["missilecommand_config"]`, merged into `C` at boot via an
  explicit allowlist. **`N_CITIES` is deliberately NOT exposed** — it's
  tied to the fixed 6-entry `CITY_X` array of x-positions; overriding it
  alone would desync city rendering/damage indexing.

## Most recent pass

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier: migrated the flyby cameo(s) to `/mascots.js` as part of a
site-wide sweep — see the root `HANDOFF.md`'s mascots.js entry. The old
inline copy was inside the `for(const fb of s.flyers)` loop; now it's a
single call per flyer.

Prior passes: chicken-raid waves (every 5th, 5 spacesuit chickens, no
other missiles) capped at 2 bombs on screen at once so the wave doesn't
overwhelm; gentler difficulty curve with rounder colors, gliding ghosts
(shared pass with pacman).

## Open / deferred

Nothing currently open for this game.
