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

## Open / deferred

Nothing reported yet — this is a new game, added from the same
"1978-88 arcade shortlist" home-page pick as Tempest ("Build Tempest
now" + later narrowed to Tempest, Defender, Robotron: 2084, Elevator
Action, Burgertime).
