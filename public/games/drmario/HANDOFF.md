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
     bottle (`docCtx`-based, `drawDoc()`). **Deliberately NOT drawn from
     `/mascots.js`** — she's a surgical-mask doctor now (her own body,
     a teal mask with an ear-loop strap, the white coat, a head-mirror
     band), not a spacesuit variant, so unifying her with the shared
     spacesuit sprite would be the wrong direction on purpose.
- Chickens-as-lives with a 9-row (not 6) neck-unjam so one lost chicken
  gives real breathing room instead of cascading into an instant game
  over.

## Most recent pass

**Redesigned Dr Chicken's portrait (#2 above)** from the old spacesuit
look (jetpack flare, life-support pack, helmet dome — same visual
language as the site's spacesuit cameos) to an actual doctor: surgical
mask with an ear-loop strap over her beak, the white coat kept (it
already read as "doctor"), and a head mirror on a band replacing the
helmet. This was the last open piece of the original mascot-library
comment — the whole comment is now archived. `drawDoc()` isn't exported
on `window.__drmario` (it's DOM-only, closure-scoped over `docCv`); any
future test needs to boot the whole page through a mocked `document`
(canvas mock for `id==="doc"`) and let the page's own initial
`requestAnimationFrame(frame)` call it once — see the scratchpad test
`drmario-doctorredesign-test.js` for the pattern (separate ctx mocks
per canvas, since `draw()`/`drawNext()` share the same call log
otherwise and pollute assertions meant only for the portrait).

Earlier: migrated the bonus-round cameo (#1 above) to `/mascots.js` as
part of a site-wide sweep — see the root `HANDOFF.md`'s mascots.js
entry. No gameplay change either time.

Earlier still: bonus round every 5 levels (spacesuit chicken drifts the
bottle, drop bricks on it for points, then advance); eased virus
density/drop-speed curves and the more generous unjam; levels with a
denser bottle each clear; chickens as lives with the original neck-unjam.

## Open / deferred

Nothing currently open for this game.
