# Memory Match (memory) — per-game handoff

Classic memory/concentration: flip pairs of emoji cards, clear the board
in as few moves as possible, timed and tracked against a best score.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Tracks moves, a timer, and a persisted best score.

## Most recent pass

**Bug fix (found in a code-review pass, not player-reported): abandoning
a game mid-flip could throw or corrupt the next game.** Match/mismatch
resolution used `setTimeout` closures that read shared module-level
`first`/`second` variables instead of a snapshot. The "New Game" button
ignores the `lock` guard, so clicking it mid-flip reset `first`/`second`
to `null` without cancelling the pending timer — when that stale timer
later fired, it either threw (reading `.card` off `null`) or, if a new
pair had already been picked, silently corrupted the new game's
`matched`/`moves` state. Fixed by capturing the pair and a game "epoch"
counter locally when scheduling each timer, cancelling any pending timer
on `newGame()`, and making a stale-epoch timer a no-op.

Earlier: no dedicated feedback pass yet beyond the original build and the
site-wide comments-widget rollout.

## Open / deferred

- **No `window.__memory` test export** — worth adding if this game gets
  a future gameplay pass.
