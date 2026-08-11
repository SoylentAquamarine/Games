# Chicken Burger Time (burgertime) — per-game handoff

Burger Time clone: 3 ladder columns run the full height of a 5-row
kitchen. Each column carries a 4-piece sandwich (bun, patty, cheese,
bun) staggered across the rows; walk onto a piece to send it down a
level, and drop it onto a fox to squash it. Get every sandwich onto
the tray (the bottom row) while dodging (or pepper-stunning) the foxes
chasing you.

## What's here

- `index.html` — everything, split into a pure sim and a thin DOM/canvas
  layer (same pattern as the other new arcade games this pass).
  `window.__burgertime` exposes the whole sim: `newGame`, `nextWave`,
  `move`, `climb`, `stepPlayer`, `stepOnIngredients`, `spawnEnemies`,
  `stepEnemies`, `shakePepper`, `waveClear`, `die`, plus helpers
  (`nearestCol`, `atCol`, `makeLanes`, `allDelivered`, `enemyCountFor`,
  `enemySpeedFor`) and constants.
- **Columns do double duty**: `COLS` (3 x-positions) are both the
  ladders you climb between rows AND the lanes each sandwich sits in —
  a deliberate simplification of the original's separate platform/lane
  layout that keeps the whole board legible on a small canvas while
  keeping the real tension (you have to be in the right place, on the
  right row, while foxes converge).
- **Dropping is edge-triggered**: each ingredient has an `armed` flag —
  walking onto it while armed drops it one row and disarms it;
  standing there afterward (now on the tile it fell TO, not the one it
  fell FROM) doesn't cause a chain of instant drops, and it only
  re-arms once you leave the tile and come back. Reaching the bottom
  row (`ROWS-1`) marks it `delivered` and scores `DELIVER_SCORE`.
- **Squashing**: the moment an ingredient drops onto a row, any
  unstunned enemy standing in that lane on the row it just landed on is
  removed and scores `SQUASH_SCORE` — the original's signature "drop a
  bun on their head" kill, checked as part of the same
  `stepOnIngredients` call that resolves the drop.
- **Pepper**: `shakePepper` stuns (not kills) every enemy on the
  player's row, ahead of their facing direction, within `PEPPER_REACH`
  — `PEPPER_PER_WAVE=3`, refilled every `nextWave()`. A stunned enemy
  (`stunT>0`) neither chases, climbs, nor deals contact damage, and
  can't be double-squashed by a falling ingredient while stunned
  (avoids double-counting one enemy's death two ways at once).
- **Death keeps ingredient progress**: `die()` only resets the player's
  position (back to the top-left column) and clears live enemies —
  `s.lanes` (which pieces have dropped/delivered) is untouched, so a
  death doesn't wipe out a level's progress. Matches the forgiving
  choice already made in `games/elevatoraction/` for its documents.
- Standard site conventions: `/arcade.js`, `/startgate.js`,
  `/comments.js`, `/fullscreen.js`, `burgertime_best` in localStorage.

## Design notes / deliberate scope decisions

- **No mascot flyby cameo**, same reasoning as the other new games this
  pass — kept scope contained across five new games shipped in one
  sitting.
- **Ladders and lanes share the same 3 x-positions** rather than the
  original's separate, denser platform grid — see above; a deliberate
  legibility trade-off for a small canvas, not an oversight.
- **No "walk under a still-falling ingredient" hazard** — in the
  original, a dropping ingredient can also flatten the PLAYER if
  they're standing where it lands; here it only affects enemies, so the
  drop mechanic is purely offensive from the player's side. Could be
  added later for extra risk/reward.

## Open / deferred

Nothing reported yet — this is a new game, added from the same
"1978-88 arcade shortlist" home-page pick as Tempest, Defender,
Robotron and Elevator Action ("Build Tempest now" + later narrowed to
Tempest, Defender, Robotron: 2084, Elevator Action, Burgertime). This
was the last of the five.
