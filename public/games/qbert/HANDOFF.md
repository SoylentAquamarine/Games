# ChickenBert (qbert) — per-game handoff

Q*bert-style pyramid hopper: hop every cube to change its color, dodge
hunters, use warp pads to escape.

## What's here

- `index.html` — everything. `window.__qbert` exposes the pure sim
  (`newState`, `hop`, `target`, `onPyramid`, `done`, `allChanged`,
  `resetBoard`, `spawnEnemy`, `enemyStep`, `plan`, `padAt`, `loseChicken`,
  `awardExtras`, `BASE`, `C`).
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
  (extra-chicken score threshold) and `CHICKENS` (starting lives). Uses
  the site's generic numeric-knob config pattern (see kaboom's
  HANDOFF.md) — saved to `localStorage["qbert_config"]`, merged into `C`
  at boot via an explicit allowlist.

## Most recent pass

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
