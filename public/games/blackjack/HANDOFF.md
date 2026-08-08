# Blackjack (blackjack) — per-game handoff

Standard casino blackjack against a dealer: bet chips, hit/stand/double,
dealer stands on 17, blackjack pays 3:2.

## What's here

- `index.html` — everything, built on the shared `/games/cards/cards.js`
  deck engine (`Cards.shuffle`, `Cards.makeDeck`, `Cards.cardEl`).
  `window.__bj` exposes the pure hand-value helpers (`handValue`, `isBJ`,
  `cardVal`) for headless testing.
- Chips start at 100, bet adjustable in $10 steps via +10/−10 buttons
  (floor of $10). The shoe is 4 decks shuffled together
  (`Cards.shuffle` of four `Cards.makeDeck()` calls), auto-reshuffled once
  fewer than 15 cards remain.
- A 2-card 21 on the initial deal is a blackjack: it pays 1.5x and
  auto-resolves the round immediately via `revealAndSettle()`, skipping
  the hit/stand prompt. A dealer blackjack against a non-blackjack player
  hand is an instant loss the same way.
- Double doubles the bet and draws exactly one more card, then auto-stands;
  it's disabled after the first hit or if chips can't cover doubling.
- Dropping below the $10 minimum bet (chips < 10) relabels the Deal button
  to "Rebuy", which resets chips to 100 on click.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
