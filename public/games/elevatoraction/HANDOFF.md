# Chicken Elevator Op (elevatoraction) — per-game handoff

Elevator Action clone: a 5-floor tower. Start on the roof, ride two
elevator shafts between floors, grab every red-door document, then
reach the getaway car on the ground floor. Enemy agents walk each
floor and shoot back.

## What's here

- `index.html` — everything, split into a pure sim and a thin DOM/canvas
  layer (same pattern as `games/tempest/`, `games/defender/`,
  `games/robotron/`). `window.__elevatoraction` exposes the whole sim:
  `newGame`, `nextWave`, `move`, `stepPlayer`, `ride`, `fire`,
  `stepBullets`, `collectDoors`, `spawnAgents`, `stepAgents`,
  `resolveHits`, `checkExit`, `waveClear`, `die`, plus helpers
  (`nearestShaft`, `inShaft`, `makeDoors`, `totalDocs`,
  `agentCountFor`, `agentSpeedFor`) and constants.
- **Floors and shafts**: `FLOORS=5`, floor 0 is the roof (start), floor
  `FLOORS-1` is the ground (exit). Two elevator shafts (`SHAFTS`) run
  the full height of the building; `inShaft(x)` checks whether the
  player's x is within `SHAFT_CATCH` of one. `ride(s,dir)` only works
  while standing in a shaft, not already riding, and won't go past the
  roof or ground floor — it sets `rideTarget` and flips `riding=true`;
  `stepPlayer` then eases `py` toward `rideTarget` at `ELEVATOR_SPEED`
  each frame and snaps `floor`/clears `riding` on arrival. Walking,
  firing and document pickup are all disabled while `riding` — you're
  briefly vulnerable and unable to act mid-elevator, same as the
  original.
- **Documents**: `makeDoors()` places one door per `(DOOR_FLOORS x
  DOOR_XS)` combination (the middle 3 floors only — the roof and ground
  floor have none). `collectDoors` auto-collects any untaken door on
  the player's current floor within reach, scoring 300 each.
  `totalDocs()` is the doors array length, so the exit condition and
  the HUD counter can never drift out of sync with what's actually
  placed.
- **Exit condition**: `checkExit` requires ALL of: on the ground floor,
  not mid-ride, `docsCollected>=totalDocs()`, and standing at `EXIT_X`
  (the car, rendered green once every document is in). `waveClear`
  additionally requires the floor to be clear of agents — reaching the
  car early with agents still up doesn't shortcut the wave.
- **Agents**: home toward the player's x only when sharing the same
  floor; on other floors they patrol back and forth. They take
  occasional shots (`AGENT_SHOOT_COOLDOWN`) when on the player's floor,
  aimed toward the player's current x at the moment of firing (not
  tracking afterward — a straight shot, matching the arcade original's
  feel). Killed in one hit (150pts).
- Standard site conventions: `/arcade.js`, `/startgate.js`,
  `/comments.js`, `/fullscreen.js`, `elevatoraction_best` in
  localStorage.

## Design notes / deliberate scope decisions

- **No mascot flyby cameo**, same reasoning as the other new games this
  pass — kept scope contained across five new games shipped in one
  sitting.
- **No shoot-out-the-lights mechanic** — the original's signature
  "darken a hallway to make agents less accurate" feature was left out
  to keep this pass's scope contained; a good candidate for a later
  pass if requested.
- **No crushing agents with the elevator** — agents are dealt with by
  gunfire only. Elevator-crush collision would need careful timing
  logic against a rider mid-transit; skipped for this pass rather than
  rushed.
- **Documents persist across a death, only position resets** — losing a
  life sends the player back to the roof but keeps `docsCollected` and
  which doors are `taken`, which reads fairer for a browser game than
  losing all progress on death.

## Open / deferred

Nothing reported yet — this is a new game, added from the same
"1978-88 arcade shortlist" home-page pick as Tempest, Defender and
Robotron ("Build Tempest now" + later narrowed to Tempest, Defender,
Robotron: 2084, Elevator Action, Burgertime).
