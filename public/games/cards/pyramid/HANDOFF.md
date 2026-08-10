# Pyramid Solitaire (cards/pyramid) — per-game handoff

Classic Pyramid solitaire: pair up exposed cards that sum to 13 to
clear the pyramid.

## What's here

- `index.html` — everything. `window.__pyramid` exposes the pure sim
  for headless testing, built on the shared `/games/cards/cards.js`
  engine (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note, which had missed the individual `cards/` sub-games).
Everything under "What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
