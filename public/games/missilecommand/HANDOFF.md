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

## Most recent pass

Migrated the flyby cameo(s) to `/mascots.js` as part of a site-wide
sweep — see the root `HANDOFF.md`'s mascots.js entry. The old inline copy
was inside the `for(const fb of s.flyers)` loop; now it's a single call
per flyer. No gameplay change.

Prior passes: chicken-raid waves (every 5th, 5 spacesuit chickens, no
other missiles) capped at 2 bombs on screen at once so the wave doesn't
overwhelm; gentler difficulty curve with rounder colors, gliding ghosts
(shared pass with pacman).

## Open / deferred

Nothing currently open for this game.
