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

## Most recent pass

Migrated only the flyby cameo (#1 above) to `/mascots.js` as part of a
site-wide sweep — see the root `HANDOFF.md`'s mascots.js entry. The
player's hero-avatar sprite (#2) is untouched. No gameplay change.

Prior pass: 25-level plan, chickens, warp pads, and a second hunter added
in one pass (`feat(qbert): 25-level plan, chickens, warp pads and a
second hunter`).

## Open / deferred

Nothing currently open for this game.
