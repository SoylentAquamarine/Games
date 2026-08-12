# ChickenBert (qbert) — per-game handoff

Q*bert-style pyramid hopper: hop every cube to change its color, dodge
hunters, use warp pads to escape.

## What's here

- `index.html` — everything. `window.__qbert` exposes the pure sim
  (`newState`, `hop`, `target`, `onPyramid`, `done`, `allChanged`,
  `resetBoard`, `spawnEnemy`, `enemyStep`, `plan`, `padAt`, `loseChicken`,
  `stepDying`, `awardExtras`, `BASE`, `C`).
- 25-level plan, chickens as lives, warp pads, and two hunters.
- **Two visually similar but unrelated orange sprites in this file** —
  don't conflate them:
  1. A flyby cameo (`flypast`), drawn via the shared `/mascots.js` library
     (`Mascots.spacesuitChickenFlying`) — the site-wide decorative
     mascot.
  2. The player's own hero-chicken avatar (drawn separately, fillRect-
     based comb rather than arcs, different eyes, no visor) — this is
     NOT part of the mascot library and was deliberately left alone
     during the mascots.js migration.
- **Admin-configurable** at `/admin/games/?game=qbert`: `EXTRA_EVERY`
  (extra-chicken score threshold), `CHICKENS` (starting lives), and
  `DEATH_FRAMES` (death freeze duration). Uses the site's generic
  numeric-knob config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["qbert_config"]`, merged into `C` at boot via an
  explicit allowlist.
- **Getting caught freezes play for `DEATH_FRAMES` (50 frames, ~0.8s)
  before resetting to the apex** — see "Most recent pass". `s.dying`
  gates `hop()`/`enemyStep()` to no-ops while active; `stepDying()`
  performs the actual apex reset once it elapses. A fatal catch (the
  last chicken) skips the freeze and cuts straight to Game Over.

## Most recent pass — death animation

**Player feedback: "if the enemy lands on me I need a short death
animation."** Getting caught used to reset `s.q`/`s.enemies` on the
very same tick the collision happened — the hero's sprite (drawn at
`s.q`) snapped back to the apex instantly, with nothing but
`Arcade.sfx.death()` to mark what happened. `loseChicken()` now sets
`s.dying=C.DEATH_FRAMES` instead of resetting position immediately
(unless it's a fatal catch — the last chicken skips straight to Game
Over, same as breakout's final-life short-circuit); a new
`stepDying()`, called every frame while `s.dying>0`, counts it down
and only then resets `s.q`/`s.enemies`. `hop()` and `enemyStep()` both
no-op while frozen, and the DOM layer's `go()` handler and the
enemy-spawn/movement loop in `frame()` are gated the same way, so
nothing moves during the freeze. `draw()` adds a red flash over the
frozen scene that fades out as the freeze counts down. New knob:
`DEATH_FRAMES` (default 50), registered in the admin config panel
alongside the two that already existed.

Tested via a new `qbert-death-pause-test.js` (17 checks: the freeze
starts on a non-fatal catch and leaves the hero at the collision cube
rather than the apex, `hop()`/`enemyStep()` are no-ops while frozen,
the apex reset and enemy-clear happen exactly once the freeze reaches
0 — not before, a fatal catch skips the freeze entirely, and the
`DEATH_FRAMES` knob is overridable via `localStorage`). All 3
pre-existing qbert test files still pass unchanged. Live-verified:
deployed, forced a collision via the exposed sim and confirmed the
freeze starts with the hero held at the fatal cube, confirmed the
admin override applies, zero console errors.

## Earlier pass

**Bug fix (found in a code-review pass, not player-reported): dying on
the final cube could silently complete the level.** `hop()` coated the
landing cube with color BEFORE checking for an enemy on that cell.
Getting caught returned early via `loseChicken`, skipping the `done(s)`
check for that hop — but the cube's color was already mutated, so the
board could become secretly "done" underneath a death. The very next
completely ordinary hop would then re-trigger `done(s)===true` and
silently award a bogus level-complete bonus and advance the level. Moved
the enemy-collision check before the cube-coloring logic so a caught hop
never touches the cube.

Earlier: added the admin config pane described above — no gameplay
change to the defaults.

Earlier still: migrated only the flyby cameo (#1 above) to `/mascots.js` as
part of a site-wide sweep — see the root `HANDOFF.md`'s mascots.js
entry. The player's hero-avatar sprite (#2) is untouched.

Prior pass: 25-level plan, chickens, warp pads, and a second hunter added
in one pass (`feat(qbert): 25-level plan, chickens, warp pads and a
second hunter`).

## Open / deferred

Nothing currently open for this game.
