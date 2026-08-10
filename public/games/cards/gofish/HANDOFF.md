# Go Fish (cards/gofish) — per-game handoff

Classic Go Fish against a computer opponent: ask for a rank, "go fish"
if they don't have it, collect books of four.

## What's here

- `index.html` — everything. `window.__gofish` exposes the pure sim for
  headless testing, built on the shared `/games/cards/cards.js` engine
  (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note, which had missed the individual `cards/` sub-games).
Everything under "What's here" reflects the game as originally built.

## Open / deferred

The root HANDOFF.md's "Single-player still queued" note lists Go Fish
as a candidate for online multiplayer (it "can reuse `cards.js`") — not
started, no player ask behind it yet, just a noted opportunity.
