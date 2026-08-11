# Chicken Joust (joust) — per-game handoff

Joust-style flying-lance combat on floating platforms: flap to gain
altitude, joust higher than the enemy to win the collision.

## What's here

- `index.html` — everything. `window.__joust` exposes the pure sim
  (`newState`, `step`, `physics`, `joustResult`, `makeWave`, `moveEnemy`,
  `spawnOnNest`, `die`, `drainSpawnQueue`, `waveClear`, `PLATS`, `NESTS`,
  `C`).
- The board wraps horizontally — flying off one edge brings you back on
  the other side. There is no "touches the wall" invariant to preserve;
  that was a stale test assumption fixed in an earlier bug-hunt pass, not
  a game rule.
- Enemies patrol left/right along platforms rather than homing in on the
  player; a nest respawn plays a hatch animation with a brief safe
  no-hit window afterward.
- **Several respawn nests** (`NESTS=[0,1]`, the two ground-level side
  platforms) — `spawnOnNest()` picks one at random each time, not always
  the same fixed platform. Both are drawn with the twig/egg nest
  decoration (`NESTS.includes(i)` in `draw()`).
- **Enemies spawn one at a time**, not all at once already airborne — a
  wave's enemies are queued (`s.enemyQueue`) and released into
  `s.enemies` one every `SPAWN_GAP` frames (`drainSpawnQueue()`, called
  from both the normal and hatching branches of `step()`).
  `waveClear(s)` checks the queue is ALSO empty before advancing to the
  next wave, not just the active list.
- **Defeating an enemy has an `EGG_CHANCE` (25%) chance to drop an egg**
  — it falls like anything else and can be flown into for a 200-point
  bonus, or is lost if it reaches the lava uncollected.
- A dirt ground layer covers most of the lava strip visually (the actual
  death line, `C.LAVA`, is unchanged) — lava still peeks through in
  patches every third segment.
- **Admin-configurable** at `/admin/games/?game=joust`: `SPAWN_FRAMES`
  (respawn delay), `INVULN_FRAMES` (post-respawn safe window),
  `FLIP_CHANCE` (enemy random-flip chance per frame). Uses the site's
  generic numeric-knob config pattern (see kaboom's HANDOFF.md) — saved
  to `localStorage["joust_config"]`, merged into `C` at boot via an
  explicit allowlist. Core flight feel (`GRAV`/`FLAP`/`MOVE`/`MAXVX`) is
  deliberately not exposed.

## Most recent pass — farmer rider sprite

**Player feedback: "new sprites with more detail, it should be the
farmer riding a chicken, fighting other chickens."** `bird(o, col)` used
to draw the exact same silhouette (comb/beak/wattle/tail feathers) for
the player AND every enemy, just recolored, with one plain rectangle as
a "rider" on all of them regardless of who it was. Now `bird(o, col,
rider)` takes a third argument: when `rider` is true it calls a new
`drawFarmer()` — a straw hat (brim + crown), a face, and overalls with
straps, positioned where the old plain rectangle sat — and when false
(every enemy) it draws nothing extra, so enemies read as plain chickens
with no rider at all. Call sites: the player (`bird(pl,"#22d3ee",true)`)
and the hatching/respawning player (`bird(o,"#22d3ee",true)`) both get
the farmer; every enemy (`bird(e,"#f0616e",false)`) doesn't. The
underlying chicken silhouette itself is unchanged for both.

## Earlier pass

**Player feedback: "this is a good standard arcade screen size. we need
ground covering the lava. we need several respawn nests. The enemies
have to spawn one at a time at the beginning of a level. Reduce gravity
by 25%. When an enemy is killed, 25% chance it will drop an egg."** All
five actionable parts landed together — described above. Gravity: an
earlier pass already cut it 10% (`GRAV_MUL` 0.9); this request layered a
further 25% cut on top (`0.9*0.75` = 0.675 total), not a fresh
standalone 25%. The screen-size line names joust's OWN canvas as the
reference for a separate, cross-cutting "make every game the same size"
initiative touching other games — nothing to change here for that part.

Earlier: added the admin config pane described above — no gameplay
change to the defaults at that point.

Earlier still: scaled everything up: hero + enemy sprites doubled (2x),
10% less gravity to keep the larger sprites feeling right at the new
scale. Earlier still: the whole screen/board scaled 50%/25% bigger;
enemy AI changed from homing to left/right patrol, plus the nest-hatch
respawn animation and its safe window.

## Open / deferred

Nothing currently open for this game.
