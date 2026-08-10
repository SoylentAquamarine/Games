# Spades (cards/spades) — per-game handoff

Classic Spades, partnered 2v2 against computer opponents: bid, spades
are always trump, make your contract.

## What's here

- `index.html` — everything. `window.__spades` exposes the pure sim for
  headless testing, built on the shared `/games/cards/cards.js` engine
  (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note, which had missed the individual `cards/` sub-games).
Everything under "What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
