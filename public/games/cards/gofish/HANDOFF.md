# Go Fish (cards/gofish) — per-game handoff

Classic Go Fish against a computer opponent: ask for a rank, "go fish"
if they don't have it, collect books of four.

## What's here

- `index.html` — everything. `window.__gofish` exposes the pure sim for
  headless testing, built on the shared `/games/cards/cards.js` engine
  (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Added explanations for `askRank()`'s easy-to-miss "go again" rule
(drawing the rank you asked for from the pond still earns another
turn) and `cpuMove()`'s deliberately simple no-memory random-rank
strategy. Comment-only — no logic touched. Live-verified: deployed,
zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note, which had missed
the individual `cards/` sub-games). Everything under "What's here"
reflects the game as originally built.

## Open / deferred

The root HANDOFF.md's "Single-player still queued" note lists Go Fish
as a candidate for online multiplayer (it "can reuse `cards.js`") — not
started, no player ask behind it yet, just a noted opportunity.
