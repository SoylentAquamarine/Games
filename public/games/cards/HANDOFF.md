# Shared Cards engine (`cards.js`) — handoff

Reusable card-game engine used by every card game on the site: Cards
(deck legend/theme picker), Blackjack, Crazy Eights, FreeCell, Go Fish,
Hearts, Klondike, Pyramid, Spades, Video Poker and War. One file, one
`<script src="/games/cards/cards.js">` include, `window.Cards` everywhere.

## What's here

- `cards.js` — standard deck model (`makeDeck`, `shuffle`, `deal`,
  `split`), a CSS card-face renderer (`cardEl`, styles injected on load),
  and 5 deck themes (`THEMES`, `setTheme`, `getTheme`, persisted to
  `localStorage["cards_theme"]`). Suits are always `S/H/D/C` internally —
  no game's logic depends on the active theme.
- Card faces: numeric cards (2-10, Ace) show a suit pip; Jack/Queen/King
  show a hand-drawn chicken portrait (`faceArt`) — a cockerel jack, hen
  queen, rooster king. The body uses `currentColor` so it always takes the
  card's red/black suit colour.
- **Suit glyphs on the card itself are always the classic ♠♥♦♣** — see
  `Cards.SUIT_SYMBOL`. Deck themes never override this; only the K/Q/J
  portrait and the card back change per theme (see "Most recent pass").

## Most recent pass

**Player feedback: "ok i like the new card sets but the suits need to
remain normal suits but the KQJ cards can have different pictures of the
chickens in different styles."** Two changes:

1. `cardEl()` now always draws `SUIT_SYMBOL[suit]` (classic ♠♥♦♣) on
   numeric cards, regardless of the active theme. Themes used to swap in
   their own emoji glyphs here (e.g. barnyard's 🪶🐓🥚🌽) — removed.
2. `faceArt(rank, theme)` now takes the active theme and recolours the
   portrait (comb/beak/crown/shell) plus adds a small accessory badge near
   the crown, via each theme's `face:{comb,beak,gold,shell,accessory}`
   block: a wheat sprig (Barnyard), an egg (Coop), a sun (Sunny Side), a
   leaf (Orchard). Classic has no accessory — it's the bare baseline look.
   The badge is drawn by `accessoryArt(kind)` at a fixed spot in the
   44×60 viewBox that clears the head across all three court ranks, so it
   didn't need separate per-rank tuning.

The per-theme `sym` field on `THEMES` is gone (nothing reads it anymore —
`carddeck/index.html`'s deck-legend page, the only other place that used
to read a theme's `sym`, now shows `Cards.SUIT_SYMBOL` like the cards do).

## Open / deferred

Nothing currently open for this game.
