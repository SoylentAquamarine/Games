# Dr. Chicken (drmario) — per-game handoff

Dr. Mario-style falling-pill puzzle: clear viruses by matching colors,
chickens as lives with a neck-unjam mechanic, a bonus round every 5
levels.

## What's here

- `index.html` — everything. `window.__drmario` exposes the pure sim
  (`newState`, `emptyGrid`, `clearMatches`, `settle`, `resolve`,
  `countViruses`, `cellsOf`, `canPlace`, `newPill`, `virusesFor`,
  `dropSpeed`, `winLevel`, `advanceLevel`, `startBonus`, `bonusStep`,
  `bonusDrop`, `bonusMove`, `loseChicken`, `C`).
- **Two separate spacesuit-chicken-colored sprites in this file — do not
  conflate them:**
  1. The bonus-round cameo (`drawBonus()`) — drawn via the shared
     `/mascots.js` library (`Mascots.spacesuitChicken`, the plain
     variant, no jetpack).
  2. **"Dr Chicken"** — the persistent side-panel portrait watching the
     bottle (`docCtx`-based, a more elaborate composed pose: white coat +
     helmet dome). This one is **deliberately NOT migrated** to
     `/mascots.js`. The original mascot-library player comment wants this
     specific character redesigned as a surgical-mask variant instead of
     a spacesuit — unifying it with the shared spacesuit sprite now would
     move it the wrong direction. Leave it alone until that redesign
     happens.
- Chickens-as-lives with a 9-row (not 6) neck-unjam so one lost chicken
  gives real breathing room instead of cascading into an instant game
  over.

## Most recent pass

Migrated the bonus-round cameo (#1 above) to `/mascots.js` as part of a
site-wide sweep — see the root `HANDOFF.md`'s mascots.js entry. Dr
Chicken's own portrait (#2) is untouched by design. No gameplay change.

Prior passes: bonus round every 5 levels (spacesuit chicken drifts the
bottle, drop bricks on it for points, then advance); eased virus
density/drop-speed curves and the more generous unjam; levels with a
denser bottle each clear; chickens as lives with the original neck-unjam.

## Open / deferred

- **Dr Chicken's surgical-mask redesign** — the original mascot-library
  comment asked for this character to become a different design (mask,
  not spacesuit) with more per-game detail. Not started; needs a design
  pass, not a migration.
