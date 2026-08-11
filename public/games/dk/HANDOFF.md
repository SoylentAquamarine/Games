# Chicken Climb (dk) — per-game handoff

Donkey Kong-style climbing game: girders, ladders, eggs rolling downhill
you have to jump, climb to the top and touch the hen to win.

## What's here

- `index.html` — everything. `window.__dk` exposes the pure sim
  (`newState`, `move`, `jump`, `jumpHeight`, `barrelStep`, `collide`,
  `ladderAt`, `spawnBarrel`, `resetPlayer`, `stepDying`, `nextLevel`,
  `stepWinning`, `spawnFlyby`, `spawnStart`, `spawnGap`, `C`,
  `BOARD_CYCLE`, `boardTypeFor`, `RIVET_ROWS`, `RIVET_COLS`, `makeRivets`,
  `BELT_FLIP_AT`, `makeBeltDirs`, `stepBelt`, `checkRivets`, `beltDirFor`).
- No unified `step(s,input)` — movement/jump/spawn/collision are separate
  pure functions the DOM-layer `frame()` calls in sequence each tick, each
  gated on the right state (dying, winning, or normal play).
- Girders alternate slope direction by row (`rowDir`); eggs always roll
  downhill along their own girder (`barrelStep`), occasionally dropping
  down a ladder to the girder below.
- The farmer's on-screen position (`ax`/`ay`) eases toward its logical
  grid cell via `glide()` (constant-speed, not exponential — avoids the
  "lurches then decelerates" feel exponential easing gives) for walking,
  `ease()` for barrels (tumbling look is fine there).
- **3 board types now cycle by level** (`BOARD_CYCLE`, `boardTypeFor`):
  girders → conveyor → elevator → repeat. All 3 reuse the exact same
  ladder layout and hen-touch win condition, so completability doesn't
  need separately proving per board — each type changes ONE real
  mechanic instead of just a palette swap:
  - `girders` — sloped platforms, eggs roll downhill per row (`rowDir`).
  - `conveyor` — flat belts. `beltDirFor(s,row)` reads `s.beltDirs[row]`
    instead of `rowDir`; every row's direction flips at once, once,
    partway through the level (`BELT_FLIP_AT`, via `stepBelt()`).
  - `elevator` — flat platforms with 8 rivets (`RIVET_ROWS`×`RIVET_COLS`)
    embedded in the middle 4 girders. `checkRivets()` pops a rivet when
    the player walks onto it; popping all of them sets `s.won=true`
    immediately — an alternate win alongside touching the hen (kept as a
    safety net in case a rivet spot ever reads as awkward to reach).
  - The HUD's Board indicator, girder tint/markings, and the level-up
    message all reflect the active `s.boardType`.

## Most recent pass

**Player feedback (follow-up, after being asked to pick the 2 remaining
board types): "conveyor belts + elevators (classic)."** Shipped both —
see "What's here" above for the mechanics. This closes out the last
open piece of the original board-cycling ask; the whole comment is now
archived.

Earlier: **three-part player feedback:**
1. **"touch the chicken to win"** — reaching row 0 anywhere used to win;
   now requires being at the hen's exact column (`HEN_COL`) too.
2. **"multiple boards with a difficulty curve"** — distinct board TYPES
   were deferred pending the player's own design ("I will come up with
   something") at the time. What shipped then: winning starts the next
   LEVEL on the SAME board (`nextLevel()`) rather than ending the run —
   eggs spawn meaningfully faster each level (`spawnStart`/`spawnGap` both
   scale down with level). Gotcha fixed along the way: the ongoing spawn
   gap used to reset to a flat range on every egg regardless of level, so
   the difficulty curve only ever applied to the very first egg of a run.
3. **"every 5 levels the space suit chicken flies past"** — added
   (`FLYBY_EVERY`), matching the site-wide decorative cameo pattern.

Also already fixed in an earlier pass (before this HANDOFF.md existed):
eggs always roll downhill now (`rowDir`, `barrelStep` — used to keep
whatever direction they had, rolling uphill on half the girders), and the
farmer's movement is a steady glide instead of a jerky exponential ease.

## Open / deferred

Nothing currently open for this game.
