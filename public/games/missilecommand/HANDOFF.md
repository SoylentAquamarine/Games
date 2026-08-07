# Chicken Command (missilecommand) — per-game handoff

Missile Command-style city defense: intercept incoming missiles before
they land, keep your cities standing.

## What's here

- `index.html` — everything. `window.__mc` exposes the pure sim
  (`newGame`, `startWave`, `spawnEnemy`, `spawnChicken`, `stepEnemy`,
  `fire`, `stepExplosion`, `explosionHits`, `cityIndexAtX`, `tick`,
  `stepFlyby`, `recover`, `dist`, `C`).
- Every 5th wave is a pure chicken raid — no regular missiles, just 5
  spacesuit chickens released one at a time (`s.flyers`, spawn-gapped wide
  enough that only one is ever on screen at once), each drawn via the
  shared `/mascots.js` library (`Mascots.spacesuitChickenFlying`). They
  never drop bombs — shoot one for a 1000pt bonus, or let it fly off; it's
  a risk-free shooting gallery, not a real wave.
- Gentler overall difficulty curve than a first pass (eased three times
  now — see "Most recent pass"), with a post-wave recovery beat
  (`recover`).
- **Admin-configurable** at `/admin/games/?game=missilecommand`:
  `BASE_AMMO`, `ENEMY_SPEED`, `INTERMISSION`, `RECOVER_EVERY`,
  `FLYBY_EVERY`. Uses the site's generic numeric-knob config pattern (see
  kaboom's HANDOFF.md) — saved to `localStorage["missilecommand_config"]`,
  merged into `C` at boot via an explicit allowlist. **`N_CITIES` is
  deliberately NOT exposed** — it's tied to the fixed 6-entry `CITY_X`
  array of x-positions; overriding it alone would desync city
  rendering/damage indexing.

## Most recent pass

**Player feedback: "difficulty curve too difficult, the bonus chicken
round is 10x as difficult as it should be, space them out and make them
not shoot, the rounds get EXTREMELY difficult too quickly."** Three
changes:

1. `startWave()` eased a third time: missile-count growth 1.25/wave →
   0.9/wave, spawn-gap floor raised (38, was 30) and closes more slowly
   (-3.5/wave, was -5), enemy speed ramp gentler and capped lower
   (+0.045/wave capped 1.05, was +0.06/1.25).
2. Chicken raids never drop bombs anymore. They used to drop real
   city/base-destroying bombs just like a normal wave (capped at
   `MAX_RAID_BOMBS`, now removed), which made a "bonus" round more
   dangerous than a real one — contradictory. The entire bomb subsystem
   (`s.bombs` state, stepping, rendering, `C.BOMB_SPEED`,
   `MAX_RAID_BOMBS` and its admin-config entry) was removed as dead
   weight along with it.
3. The chicken spawn gap widened from 48-82 frames to 250-290, so two are
   never on screen together. A chicken travels the full 414px span (off
   one edge to off the other) at 1.7-2.2px/frame — the slowest possible
   one takes up to ~244 frames to clear, so the new gap always exceeds
   that worst case.

Earlier: migrated the flyby cameo(s) to `/mascots.js` as part of a
site-wide sweep — see the root `HANDOFF.md`'s mascots.js entry.

Prior passes: chicken-raid waves (every 5th, 5 spacesuit chickens, no
other missiles) introduced; gentler difficulty curve with rounder colors,
gliding ghosts (shared pass with pacman).

## Open / deferred

Nothing currently open for this game.
