# Chicken Robotron (robotron) — per-game handoff

Robotron: 2084 clone: a closed arena, independent movement and firing
(twin-stick), and waves of rogue coop machines. Rescue every chick you
touch; shoot everything else. Brains hunt chicks and turn them into
hostile Progs if they catch one; Hulks soak up several hits and shrug
off contact otherwise.

## What's here

- `index.html` — everything, split into a pure sim and a thin DOM/canvas
  layer (same pattern as `games/tempest/` and `games/defender/`).
  `window.__robotron` exposes the whole sim: `newGame`, `nextWave`,
  `spawnWave`, `setMove`, `setFire`, `stepPlayer`, `fire`, `stepBullets`,
  `stepEnemies`, `stepHumans`, `resolveRescues`, `resolveHits`,
  `waveClear`, `die`, plus helpers (`norm`, `clampArena`,
  `grantCountFor`, `hulkCountFor`, `brainCountFor`) and constants.
- **Independent move/fire, the core Robotron idea**: `setMove`/`setFire`
  take one of the numpad-style direction codes 1-9 (5 = center/neutral)
  and set `s.moveDir`/`s.fireDir` completely separately — you can run one
  way while shooting another. Keyboard maps arrows/WASD to movement and
  IJKL + 1/3/7/9 to the 8 firing directions (held keys combine, e.g.
  holding both "fire up" and "fire right" fires diagonally); touch gets
  two independent 3x3 button grids ("Move" and "Fire").
- **Enemy roster**: Grunts (`GRUNT_SPEED`, home straight at the player,
  one hit, 100pts) and Progs (`PROG_SPEED` — faster, since they're only
  created by a Brain successfully converting a chick, so they're meant
  to feel like an escalating threat, 150pts) both use the same
  `homeToward` helper. Brains (`BRAIN_SPEED`) ignore the player entirely
  and hunt the nearest chick; catching one removes it from `s.humans`
  and adds a Prog in its place (300pts if you kill the Brain first).
  Hulks (`HULK_HP=5`) wander and bounce off the arena walls rather than
  homing, and need multiple hits to kill (500pts) — the original's
  "functionally indestructible" Hulk was simplified to "very tough" so
  every wave has a clean, always-reachable clear condition.
- **Rescue-on-contact**: `resolveRescues` removes any human within reach
  of the player and scores `RESCUE_SCORE` — no separate "carry them to
  safety" step, matching how quickly the original's touch-to-rescue
  reads in practice.
- **Extra lives**: `EXTRA_LIFE_AT=15000`, and it repeats (checked as
  `score>=nextExtraLife`, which advances by another `EXTRA_LIFE_AT` each
  time it grants one) — a real feature of the original, not just a
  single milestone.
- Standard site conventions: `/arcade.js`, `/startgate.js`,
  `/comments.js`, `/fullscreen.js`, `robotron_best` in localStorage.

## Design notes / deliberate scope decisions

- **No mascot flyby cameo**, same reasoning as `games/tempest/` and
  `games/defender/` — kept scope contained across five new games shipped
  in one sitting.
- **No Enforcers/Spheroids/Quarks** (the original's ranged/multiplying
  enemy types) — Grunts, Progs, Brains and Hulks already give the wave
  a real mix of threats (dumb rushers, a fast escalation enemy, an
  objective-hunter, and a tough obstacle) without the extra complexity
  of projectile-firing enemies or splitting Quarks. A clean follow-up if
  more variety is wanted later.
- Arena is a single fixed-size room (no scrolling) — matches the
  original's per-wave layout better than a large scrolling world would
  have (that's Defender's shape, not Robotron's).

## Open / deferred

Nothing reported yet — this is a new game, added from the same
"1978-88 arcade shortlist" home-page pick as Tempest and Defender
("Build Tempest now" + later narrowed to Tempest, Defender,
Robotron: 2084, Elevator Action, Burgertime).
