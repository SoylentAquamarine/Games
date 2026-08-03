# ChickenBoom (kaboom) — per-game handoff

Egg-catching game: a hen strutting along the top drops eggs (and, from
wave 2, rotten eggs to avoid), you slide baskets to catch them.

## What's here

- `index.html` — everything. `window.__kaboom` exposes the pure sim
  (`newState`, `step`, `catchCheck`, `startWave`, `loseBasket`,
  `spillCarton`, `waveFall`, `waveSpacing`, `rottenChance`, `C`).
- Falling objects carry a `kind`: `"egg"` (catch it), `"rotten"` (avoid —
  green, same silhouette, 2x scale), or `"bonus"` (the spacesuit-chicken
  cameo, once per `FLYBY_EVERY`-th wave, worth 200 and no penalty if
  missed). Drawn via the shared `/mascots.js` library
  (`Mascots.spacesuitChicken`) — this game used to have its own local
  `drawSpacesuitChicken()` copy, now removed.

## Most recent pass — full rework per player feedback

Was: a fixed egg count per wave, firecrackers to avoid from wave 3, and
missing any egg cost a basket outright. Now:

- Goal is filling `CARTONS_PER_WAVE` (3) cartons of `CARTON_SIZE` (12) good
  eggs each — 36 catches clears a wave, tracked via `s.cartonsFilled` /
  `s.cartonEggs`, not a fixed drop count.
- From `ROTTEN_FROM` (wave 2), rotten (green) eggs replace firecrackers as
  the hazard — catching one is now the *only* way to lose a basket.
- Missing a good egg no longer costs a basket: it spills the carton
  currently being filled back to 0 (`spillCarton`) — real lost progress,
  run continues.
- Eggs draw at 2x the old size (`EGG_W`/`EGG_H`).
- Every `FLYBY_EVERY` (5) waves, a spacesuit chicken cameo drops in once
  for a bonus catch, matching the site-wide cameo convention.

## Open / deferred

Nothing currently open for this game.
