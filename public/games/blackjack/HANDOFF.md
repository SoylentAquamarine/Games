# Blackjack (blackjack) — per-game handoff

Standard casino blackjack against a dealer: bet chips, hit/stand/double,
dealer stands on 17, blackjack pays 3:2.

## What's here

- `index.html` — everything, built on the shared `/games/cards/cards.js`
  deck engine (`Cards.shuffle`, `Cards.makeDeck`, `Cards.cardEl`).
  `window.__bj` exposes the pure hand-value helpers (`handValue`, `isBJ`,
  `cardVal`) plus `C` for headless testing.
- Chips start at 100, bet adjustable in $10 steps via +10/−10 buttons
  (floor of $10). The shoe is `C.NUM_DECKS` decks shuffled together
  (default 4, `Cards.shuffle` of `C.NUM_DECKS` `Cards.makeDeck()` calls),
  auto-reshuffled once fewer than 15 cards remain.
- A 2-card 21 on the initial deal is a blackjack: it pays
  `C.BLACKJACK_PAYOUT`x (default 1.5, i.e. 3:2) and auto-resolves the
  round immediately via `revealAndSettle()`, skipping the hit/stand
  prompt. A dealer blackjack against a non-blackjack player hand is an
  instant loss the same way.
- Double doubles the bet and draws exactly one more card, then auto-stands;
  it's disabled after the first hit or if chips can't cover doubling.
- Dropping below the $10 minimum bet (chips < 10) relabels the Deal button
  to "Rebuy", which resets chips to 100 on click.
- **Admin-configurable** at `/admin/games/?game=blackjack`:
  `DEALER_STAND` (default 17 — the dealer draws until reaching this
  total), `BLACKJACK_PAYOUT` (default 1.5), `NUM_DECKS` (default 4,
  rounded to an integer and floored at 1). Uses the site's generic
  numeric-knob config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["blackjack_config"]`, merged into `C` at boot via an
  explicit allowlist.

## Most recent pass

Added the admin config pane described above (`DEALER_STAND`,
`BLACKJACK_PAYOUT`, `NUM_DECKS`) — no gameplay change to the defaults.
Live-verified a 1-deck shoe still deals correctly.

Earlier: no player-feedback pass yet — this HANDOFF.md was created as
part of a documentation sweep (see the root HANDOFF.md's "Per-game
HANDOFF.md rollout" note). Everything under "What's here" reflects the
game as originally built.

## Open / deferred

Nothing currently open for this game.
