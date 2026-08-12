# Chicken Defender (defender) — per-game handoff

Defender clone: a wraparound scrolling world where foxes ("landers")
descend to grab chicks off the ground and carry them upward. Shoot a
lander before it escapes; shoot it mid-carry and its chick falls — fly
underneath to catch it before it hits the ground. A radar strip along
the top shows the whole world at once, Defender's signature UI.

## What's here

- `index.html` — everything, split into a pure sim and a thin DOM/canvas
  layer (same pattern as `games/tempest/`). `window.__defender` exposes
  the whole sim: `newGame`, `nextWave`, `spawnChicks`, `totalSpawned`,
  `thrust`, `stepShip`, `fire`, `stepBullets`, `spawnLanders`,
  `stepLanders`, `stepMutants`, `stepChicks`, `resolveHits`,
  `smartBomb`, `waveClear`, `die`, plus geometry helpers (`wrapX`,
  `worldDelta`, `enemyCountFor`, `landerSpeedFor`) and constants.
- **World wraparound**: `WORLD_W=2400` is the full cylindrical world
  width; `wrapX` keeps any x inside `[0,WORLD_W)`, `worldDelta(a,b)`
  returns the *shortest* signed distance between two world positions
  (handles the seam correctly) — used for the camera, AI targeting, and
  every proximity/collision check so nothing breaks near the wrap point.
  The ship always faces the direction it's thrusting (`thrust()` sets
  `facing` from the horizontal input), matching the original's
  reversible-flight feel.
- **Lander → mutant escalation**: a lander with no target seeks the
  nearest free (not carried/falling) chick and grabs it once close and
  near the ground (`stepLanders`); while carrying, it climbs straight up
  and, on reaching `TOP_Y`, the chick is permanently lost
  (`chicksLost++`) and the lander is replaced by a faster, ship-homing
  Mutant (`stepMutants`) — the core Defender risk/reward tension.
- **Catch mechanic**: shooting a lander *while it's carrying* doesn't
  just kill it for points — its chick starts `falling` under gravity
  (`stepChicks`) and is saved (scores a bonus, stays on the board) only
  if the ship is within `CATCH_DIST` when it reaches the ground;
  otherwise it's lost the same as an escaped one. The smart bomb
  (`smartBomb`) does the same to every carried chick it catches in the
  blast, so bombing mid-carry landers still gives you a chance to save
  them.
- **Mutant world (permanent)**: `TOTAL_CHICKS=10` is a lifetime cap for
  the whole game (not per-wave) — `totalSpawned(s)=chicks.length+
  chicksLost` and `spawnChicks` never lets that total exceed the cap.
  Once `chicksLost>=TOTAL_CHICKS` (every chick that ever existed is now
  gone), `mutantMode` flips on permanently: `spawnLanders` starts
  spawning Mutants directly (no more landers/chicks to protect), and
  `nextWave` stops trying to refill the population — a real, well-known
  Defender mechanic, not a simplification.
- Standard site conventions: `/arcade.js`, `/startgate.js`,
  `/comments.js`, `/fullscreen.js`, `defender_best` in localStorage,
  on-screen d-pad + Fire/Bomb buttons for touch.

## Most recent pass — real mid-air catch, gentler gravity

**Player feedback: "when i kill an enemy holding a guy the guy has to
float down so i can grab him out of the air, the gravity is way way
too strong for that."** Two problems, both in `stepChicks()`: the docs
above already described "fly underneath to catch it before it hits the
ground" as the design, but the actual catch check only ever fired
once — right as the chick's fall reached `GROUND_Y` — so flying up to
meet it partway through the fall never did anything, it only mattered
whether you happened to be under it at the very last instant.
`CHICK_FALL_G` (uncapped acceleration) also meant a long drop picked up
real speed by the time it landed. Fixed both: added a genuine mid-air
check (`midAir`, close both horizontally and at the chick's current
height) that resolves the catch immediately wherever in the fall it
happens, and cut `CHICK_FALL_G` from 0.12 to 0.045 plus added a hard
cap (`CHICK_FALL_VMAX=2.2`) so a long fall never speeds up past a
catchable float. `CHICK_FALL_G`/`CHICK_FALL_VMAX`/`CATCH_DIST` added to
the `window.__defender` export for testing. New
`defender-midair-catch-test.js` (7 checks: gravity bounds, mid-air
catch success/non-catch, ground-level catch still works unchanged) all
pass; existing `defender-test.js` unaffected. Live-verified: deployed,
zero console errors.

## Design notes / deliberate scope decisions

- **No mascot flyby cameo**, matching the call already made for
  `games/tempest/` — could fit here (the world is a flat scrolling
  strip, unlike Tempest's tube), but wasn't added this pass to keep
  scope contained across five new games shipped in one sitting. A
  reasonable follow-up if requested.
- Terrain is a flat line, not the original's hilly landscape — kept
  simple since the hills are cosmetic in the original (they don't
  affect gameplay beyond where the ground line sits).
- No Baiter-equivalent (the original's difficulty-final enemy that
  appears if you're playing too well/slow) or Pod/swarmer enemies —
  landers and their mutant escalation are the whole enemy roster for
  this pass.

## Admin config

`/admin/games/?game=defender` — 5 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `TOTAL_CHICKS`,
`CHICKS_PER_WAVE`, `LANDER_SPEED`, `SPAWN_GAP`, `SMARTBOMBS_PER_GAME`.
Same pattern as every other configurable game (e.g. kaboom): pulled
into a mutable `C` object, an IIFE reads `localStorage.defender_config`
on load and overrides any matching numeric key. `window.__defender`
exports `C` both nested (`.C`) and spread flat (`...C`), so
`G.TOTAL_CHICKS` and `G.C.TOTAL_CHICKS` are both valid — existing
tests keep working unchanged.

## Open / deferred

Nothing reported yet — this is a new game, added from the same
"1978-88 arcade shortlist" home-page pick as Tempest ("Build Tempest
now" + later narrowed to Tempest, Defender, Robotron: 2084, Elevator
Action, Burgertime).
