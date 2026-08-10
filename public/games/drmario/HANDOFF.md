# Dr. Chicken (drmario) — per-game handoff

Dr. Mario-style falling-pill puzzle: clear viruses by matching colors,
chickens as lives with a neck-unjam mechanic, a bonus round every 5
levels.

## What's here

- `index.html` — everything. `window.__drmario` exposes the pure sim
  (`newState`, `emptyGrid`, `clearMatches`, `settle`, `resolve`,
  `countViruses`, `cellsOf`, `canPlace`, `newPill`, `virusesFor`,
  `dropSpeed`, `winLevel`, `advanceLevel`, `startBonus`, `bonusStep`,
  `bonusDrop`, `bonusMove`, `jamOver`, `C`).
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
- **No lives** — jamming the neck (a new pill can't be placed because the
  stack reached the spawn point) ends the game immediately (`jamOver()`),
  matching the original Dr. Mario rule. No chickens/lives HUD panel.
- **Admin-configurable** at `/admin/games/?game=drmario`: the virus/drop
  difficulty curve — `VIRUS_BASE`/`VIRUS_STEP`/`VIRUS_MAX` (feeds
  `virusesFor(level)`) and `DROP_BASE`/`DROP_STEP`/`DROP_MIN` (feeds
  `dropSpeed(level)`). Uses the site's generic numeric-knob config
  pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["drmario_config"]`, merged into `C` at boot via an
  explicit allowlist. `rows`/`cols`/`colors` stay unexposed — they're
  board-shape, not difficulty.

## Most recent pass

**Numeric-config rollout: drmario was a flagged candidate**, previously
skipped because `C` only held board-shape constants. `virusesFor`/
`dropSpeed` already had a real, once-player-tuned difficulty curve —
just as inline formula literals (`Math.min(4+(level-1)*3, 40)` /
`Math.max(14, 34-(level-1)*2)`) rather than named, editable constants.
Extracted the 6 coefficients into `C` and rewired both formulas to
read them, then added the standard config pane.

Earlier: **player feedback: "this should not have lives, it should end when the
blocks reach the top."** Removed the "chickens as lives" system entirely
— it used to cost one of 3 lives on a jam and clear 9 rows so play
continued, a deviation from the original game's rule that reaching the
top ends the run outright. `loseChicken()` → `jamOver()`, which just sets
`over=true`; the `chickens` state field and its HUD panel are gone.

Earlier: **redesigned Dr Chicken's portrait (#2 above)** from the old spacesuit
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
