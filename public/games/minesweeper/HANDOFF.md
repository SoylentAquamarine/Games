# Minesweeper (minesweeper) — per-game handoff

Classic Minesweeper: clear the grid without detonating a mine, flag
suspected mines, numbers show adjacent mine counts.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Original build: added alongside 2048, Breakout, Simon, and
  Whack-a-Mole.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
This file had zero inline comments despite two genuinely non-obvious
bits of logic: `plant()`'s first-click-safety (mines excluded from the
clicked cell AND its 8 neighbors, so the opening reveal is always safe
and informative) and `reveal()`'s recursive flood-fill cascade (why a
0-count cell reveals all its neighbors too). Comment-only — no logic
touched; existing `minesweeper-flood-test.js` and
`minesweeper-unflag-reveal-test.js` both still pass unchanged.
Live-verified: deployed, zero console errors.

## Earlier pass — mobile long-press-unflag bug

Fixed a mobile touch bug: long-pressing a flagged cell to remove the
flag left a trailing synthetic `click` event (fired by mobile browsers
after `touchend` when neither `touchstart` nor `touchend` calls
`preventDefault`) to fall through to the reveal handler, since
`flags.has(i)` was already false by the time the click ran. This meant
attempting to *unflag* a cell instead revealed it — if that cell was a
mine, an "unflag" gesture could cause an unintended game over. Fixed
by tracking a per-cell `longPressed` flag set when the long-press timer
fires, and having the `click` handler consume-and-skip once instead of
calling `onCell`.

Earlier: No dedicated feedback pass yet beyond the original build and
the site-wide comments-widget rollout.

## Open / deferred

- **No `window.__minesweeper` test export** — worth adding if this game
  gets a future gameplay pass. A good candidate for headless testing
  since mine placement/flood-fill-reveal/first-click-safety are all pure
  logic worth verifying directly.
