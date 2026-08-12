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
  player; both the player AND every enemy now hatch from a nest with the
  same animation (see "Most recent pass" below).
- **Several respawn nests** (`NESTS=[0,1]`, the two ground-level side
  platforms) — `spawnOnNest()` (player) and `drainSpawnQueue()` (enemies)
  each pick one at random. Both are drawn with the twig/egg nest
  decoration (`NESTS.includes(i)` in `draw()`).
- **Enemies spawn one at a time**, not all at once already airborne — a
  wave's enemies are queued (`s.enemyQueue`) and released into
  `s.enemies` one every `SPAWN_GAP` frames (`drainSpawnQueue()`, called
  from both the normal and hatching branches of `step()`). Each one now
  hatches from a random nest (`e.spawning`, same countdown/immunity the
  player's own hatch uses) instead of appearing already airborne at a
  random point on screen. `waveClear(s)` checks the queue is ALSO empty
  before advancing to the next wave, not just the active list.
- **Defeating an enemy has an `EGG_CHANCE` (25%) chance to drop an egg**
  — it inherits half the slain enemy's horizontal speed (drifts the way
  the bird was actually moving, not straight down) and falls like
  anything else; fly into it for a 200-point bonus, or lose it if it
  reaches the lava uncollected.
- Ground over the lava is a single central gap (purely visual — the
  actual death line, `C.LAVA`, is unchanged) whose width grows with
  `s.wave`: mostly covered early on, progressively more lava exposed on
  later waves.
- A brief "WAVE N CLEAR" banner (`s.waveBanner`, `C.WAVE_BANNER_FRAMES`)
  pauses play between waves instead of the next batch populating the
  instant the last enemy/egg clears.
- Ground friction (`C.GROUND_FRICTION`) decays a bird's horizontal speed
  toward zero while it's standing on a platform and not actively
  steering, so releasing the controls actually stops it instead of
  coasting at whatever speed it last had until it walks off the edge.
- Every bird (player and enemy alike) is drawn with feet and a lance
  protruding forward past the beak — purely visual, the win/lose
  collision math was already position-based ("jousting" by height
  comparison) and is unchanged.
- **Admin-configurable** at `/admin/games/?game=joust`: `SPAWN_FRAMES`
  (respawn delay), `INVULN_FRAMES` (post-respawn safe window),
  `FLIP_CHANCE` (enemy random-flip chance per frame). Uses the site's
  generic numeric-knob config pattern (see kaboom's HANDOFF.md) — saved
  to `localStorage["joust_config"]`, merged into `C` at boot via an
  explicit allowlist. Core flight feel (`GRAV`/`FLAP`/`MOVE`/`MAXVX`) is
  deliberately not exposed.

## Most recent pass — authenticity pass (9 bundled player comments)

**Player feedback, 9 comments in one burst, essentially "make this play
like the real arcade game":**

1. *"new enemies shouldn't pop in out of thin air, they have to respawn
   from one of the nests with a respawn animation"* / *"when the game
   starts the hero and enemies all have to spawn from the nests"* —
   `makeWave()`'s queued enemies now carry no position at all;
   `drainSpawnQueue()` drops each one onto a random nest and starts the
   same `e.spawning` hatch countdown the player's own respawn uses.
   `moveEnemy()` holds a hatching enemy still (immune to jousting —
   `step()`'s enemy loop now skips collision while `e.spawning>0`, same
   as the player's own hatch) until it finishes, then gives it its
   starting velocity and lets it fly.
2. *"I am a farmer riding a bird and I need to fight chickens riding
   birds."* Enemies previously drew with no rider at all (an earlier
   pass's deliberate choice). Added `drawChickenRider()` — a small
   amber-colored chicken jockey, distinct from the red mount underneath
   it — so both sides now read as "someone riding a bird." `bird()`'s
   `rider` parameter changed from a boolean to a string (`"farmer"` |
   `"chicken"`).
3. *"there needs to be ground over the lava with just a little gap in
   the middle, as the levels go on and increase in difficulty there
   should be less ground and more lava."* Replaced the old fixed
   every-third-segment ground pattern with a single central gap whose
   width scales with `s.wave`.
4. *"when an enemy dies and drops an egg, the egg can't just hang in the
   air, it has to drop to the ground with sideways velocity if the bird
   that died had any."* The egg push now includes `vx:e.vx*0.5`, and the
   egg-update loop applies it (`eg.x+=eg.vx||0`) alongside its existing
   gravity fall.
5. (same change as #1)
6. *"research the actual game for some clues how to set it up, the birds
   all need lances to actually joust."* New `drawLance()` — a shaft +
   tip protruding forward past the beak on every bird. Purely visual;
   the win/lose math was already position-based.
7. *"the birds need feet and need to land on the platforms and walk and
   need to be able to slow to a stop and not just keep walking off the
   platform."* Two parts: feet added to `bird()`'s draw, and a new
   `C.GROUND_FRICTION` decays `vx` toward 0 in `physics()` whenever
   grounded with no active steering input.
8. *"the scaling seems off, the text is really small compared to other
   games."* Root cause: the canvas's own internal resolution is
   1128×846, but `.wrap`/`.hud` capped their CSS width at 690px — the
   canvas (and everything drawn on it, including all overlay text) was
   being squeezed to ~61% of its native size. Both containers'
   `max-width` now match the canvas's own 1128px cap; the "GAME OVER"
   overlay font sizes were also scaled up (24px→38px, 14px→22px) to look
   proportionate at the now-larger actual render size.
9. *"the enemies should not absolutely hug the ceiling, they are too
   difficult to kill, they need to fly more normally, and after a set
   number of enemies is killed... more respawn all at once, no enemies
   should respawn during a level."* Two parts: `moveEnemy()` now skips a
   flap while an enemy is already near the top of the screen (light
   gravity + frequent random flaps could otherwise pin it against the
   ceiling with no room for the player to get above it), and a new
   `s.waveBanner` pause (`C.WAVE_BANNER_FRAMES`, drawn as a "WAVE N
   CLEAR" banner) sits between `waveClear()` becoming true and the next
   wave actually populating, instead of the next batch appearing the
   same instant.

Verified against the full existing joust test suite (4 files) — 2 of
them needed updates for deliberately changed behavior/markup (the
rider-string change in `joust-farmer-sprite-test.js`; the wave-banner
pause and new ground-gap rendering in
`joust-nests-spawn-eggs-test.js`), all now passing. Added a new
`joust-authenticity-pass-test.js` (20 checks) covering the nest-hatch
spawn, hatch-immunity, ceiling-avoidance AI, ground friction, egg
sideways velocity, and the wave-clear banner specifically. Live-verified:
deployed, drove a real spawn through `window.__joust` and confirmed an
enemy actually appears centred on a nest mid-hatch, confirmed the canvas
and `.wrap` both render at the full 1128px width, zero console errors.

## Earlier pass — farmer rider sprite

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
