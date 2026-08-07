# ChickenBoom (kaboom) — per-game handoff

Egg-catching game: a hen strutting along the top drops eggs (and, from
wave 2, rotten eggs to avoid), you slide baskets to catch them.

## What's here

- `index.html` — everything. `window.__kaboom` exposes the pure sim
  (`newState`, `step`, `catchCheck`, `startWave`, `loseChicken`,
  `waveFall`, `waveSpacing`, `rottenChance`, `C`).
- Falling objects carry a `kind`: `"egg"` (catch it), `"rotten"` (avoid —
  green, same silhouette, 2x scale), or `"bonus"` (the spacesuit-chicken
  cameo, once per `FLYBY_EVERY`-th wave, worth 200 and no penalty if
  missed). Drawn via the shared `/mascots.js` library
  (`Mascots.spacesuitChicken`) — this game used to have its own local
  `drawSpacesuitChicken()` copy, now removed.
- **Lives are called "chickens"** (`s.chickens`), start at 3, capped at
  `C.MAX_CHICKENS` (9). One continuous carton of `C.CARTON_SIZE` (12)
  eggs fills at a time (`s.cartonEggs`, cumulative total in
  `s.cartonsTotal`) — filling one advances the wave/difficulty stage.
  Every `C.CHICKEN_EVERY` (10) cartons filled awards a bonus chicken.
  Missing a good egg OR catching a rotten one both cost a chicken
  outright (`loseChicken`) — there is no more free "spill" penalty.
- **Admin-configurable** at `/admin/games/?game=kaboom`: `ROTTEN_FROM`,
  `CARTON_SIZE`, `CHICKEN_EVERY`, `FLYBY_EVERY` are all editable there.
  Saved to `localStorage["kaboom_config"]`; the game merges it into `C`
  at boot via an explicit allowlist (see the `(function(){...})()` right
  after `const C={...}`) — only those 4 keys, only numeric values. The
  admin-side UI for it is a generic, data-driven table
  (`NUMERIC_CONFIGS` in `admin/games/index.html`) shared with 13 other
  games — adding another game to this pattern only needs one table entry
  there plus the matching allowlist snippet in that game's own file, no
  new admin HTML/JS.

## Most recent pass

**Player feedback: "start with three chickens, lose a chicken when you
break an egg or catch a green egg" and "the baskets should be an egg
carton that has to get filled up with 12 eggs, every 10 cartons is an
extra chicken."** Redesigned from the previous 3-cartons-per-wave/spill
model described in "What's here" above:

- Lives renamed `buckets`→`chickens` throughout (HUD label too), capped
  at a new `MAX_CHICKENS` (9).
- Replaced "3 cartons clear a wave" with one continuous carton at a
  time; filling it is what advances the wave now, not a fixed
  36-catch/3-carton checkpoint. `CARTONS_PER_WAVE` is gone.
- Every `CHICKEN_EVERY` cartons filled (10 by default) awards a bonus
  chicken, capped at `MAX_CHICKENS`.
- Missing a good egg now costs a chicken outright, same as catching a
  rotten one — `spillCarton()`/`s.spilled` (the old "free" penalty)
  removed entirely.
- Admin config panel's `CARTONS_PER_WAVE` knob replaced with
  `CHICKEN_EVERY`.

Earlier: added the admin config pane — no gameplay change to the
defaults at that point, just made the difficulty constants editable
without a code change. (Originally a bespoke panel; refactored into the
shared generic table once 3 more games got the same treatment in the
same session.)

Earlier still — full rework per an earlier round of player feedback: was
a fixed egg count per wave, firecrackers to avoid from wave 3, and
missing any egg cost a basket outright. That pass introduced the
carton-based goal, rotten eggs replacing firecrackers, 2x egg size, and
the `FLYBY_EVERY`-wave spacesuit chicken cameo — all still true today,
just re-plumbed around chickens/one-carton-at-a-time above.

## Open / deferred

Nothing currently open for this game.
