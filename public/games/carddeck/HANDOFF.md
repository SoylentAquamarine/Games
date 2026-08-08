# Cards (carddeck) — per-game handoff

Not a game — this is the shared deck-preview and theme picker page for
every card game on the site (Klondike, FreeCell, Pyramid, Go Fish, War,
Crazy Eights, Hearts, Spades, Blackjack, Video Poker).

## What's here

- `index.html` — renders every rank of every suit (via the shared
  `/games/cards/cards.js` engine's `Cards.cardEl`) plus the card back, so
  players can see and change the active deck theme in one place. No pure
  sim is exported (`window.__` is not used) since this page has no
  gameplay of its own — it's a preview/config surface over `Cards.THEMES`
  and `Cards.setTheme`.
- A theme selector (`Cards.THEMES.forEach(...)`) that calls
  `Cards.setTheme(t.id)` and re-renders; the choice persists (via the
  shared `cards.js` engine) and applies across every card game on the
  site, not just this page.
- A card-size toggle (Small/Medium/Large, 44/56/76px) that only affects
  this preview page's `--cw` CSS variable — it does not persist a
  site-wide size preference.
- An explicit callout inviting players to leave a comment about the deck
  itself (face cards, back, colors, sizing) since this page is the single
  source of truth for all card-game visuals.
- No admin config pane wired up for this page.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the page as
originally built.

## Open / deferred

Nothing currently open for this page.
