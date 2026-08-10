# Crazy Eights (cards/crazy8) — per-game handoff

Classic Crazy Eights: match rank or suit, 8s are wild and let you call
the next suit, first to empty their hand wins.

## What's here

- `index.html` — everything, built on the shared `/games/cards/cards.js`
  engine (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker) for the
  deck model and card rendering.
- **No pure-sim export** (`window.__crazy8` does not exist) — unlike
  most other card games on the site, this one has no headless test
  coverage yet. Worth adding if this game gets a real bug-fix pass.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note, which had missed the individual `cards/` sub-games).
Everything under "What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
