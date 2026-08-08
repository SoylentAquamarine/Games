# Stack (stack) — per-game handoff

Stack-style tower builder: tap to drop each moving block onto the tower;
overhang gets sliced off, and a fully missed drop topples the tower.

## What's here

- `index.html` — everything, canvas-based. No `window.__` export — this
  game doesn't expose a pure sim for headless testing (grepped the file
  to confirm). Loads both `/arcade.js` and `/startgate.js` (the latter as
  a separate deferred script rather than the inline `Arcade.startGate`
  pattern most other arcade games here use).
- Each new block starts at the current top width (`prev.w`) and slides
  back and forth across the full canvas width until dropped; dropping
  clips it to the overlap with the block below (`Math.max`/`Math.min` of
  the two ranges) — any non-overlapping part is simply discarded, not
  rendered as falling debris.
- Zero overlap (a total miss) ends the run (`dead()`). Drop speed ramps
  up gradually with height, capped at 7 (`if(speed<7)speed+=0.12`).
- The camera scrolls upward once the tower grows tall enough
  (`if(cur.y-camY<H*0.35)camY=cur.y-H*0.35`) so the moving block stays
  visible near the same screen position.
- Each block is colored by a rotating hue (`(i*24)%360`) rather than a
  fixed palette. Best height persisted to `localStorage["stack_best"]`.
  No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
