# Chicken Climb (dk) — per-game handoff

Donkey Kong-style climbing game: girders, ladders, eggs rolling downhill
you have to jump, climb to the top and touch the hen to win.

## What's here

- `index.html` — everything. `window.__dk` exposes the pure sim
  (`newState`, `move`, `jump`, `jumpHeight`, `barrelStep`, `collide`,
  `ladderAt`, `spawnBarrel`, `resetPlayer`, `stepDying`, `nextLevel`,
  `stepWinning`, `spawnFlyby`, `spawnStart`, `spawnGap`, `C`).
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

## Most recent pass

Three-part player feedback:
1. **"touch the chicken to win"** — reaching row 0 anywhere used to win;
   now requires being at the hen's exact column (`HEN_COL`) too.
2. **"multiple boards with a difficulty curve"** — distinct board TYPES
   (2 more, cycling like the original arcade's 3) are NOT attempted; the
   player said "I will come up with something" for those and needs to
   supply the design first. What shipped instead: winning starts the next
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

- **2 more board types**, cycling like the original arcade's 3 — needs the
  player's own board design first ("I will come up with something").
