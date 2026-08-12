# Pyramid Solitaire (cards/pyramid) — per-game handoff

Classic Pyramid solitaire: pair up exposed cards that sum to 13 to
clear the pyramid.

## What's here

- `index.html` — everything. `window.__pyramid` exposes the pure sim
  for headless testing, built on the shared `/games/cards/cards.js`
  engine (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Explained `idx()`'s triangular-number row-flattening formula,
`childrenOf()`/`isExposed()`'s "both cards resting on it must be
cleared first" exposure rule, and named `sums13()` as the actual rule
the game is named for. Comment-only — no logic touched. Live-verified:
deployed, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note, which had missed
the individual `cards/` sub-games). Everything under "What's here"
reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
