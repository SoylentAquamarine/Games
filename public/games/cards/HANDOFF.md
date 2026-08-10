# Shared Cards engine (`cards.js`) — handoff

Reusable card-game engine used by every card game on the site: Cards
(deck legend/theme picker), Blackjack, Crazy Eights, FreeCell, Go Fish,
Hearts, Klondike, Pyramid, Spades, Video Poker and War. One file, one
`<script src="/games/cards/cards.js">` include, `window.Cards` everywhere.

## What's here

- `cards.js` — standard deck model (`makeDeck`, `shuffle`, `deal`,
  `split`), a CSS card-face renderer (`cardEl`, styles injected on load),
  and 6 deck themes (`THEMES`, `setTheme`, `getTheme`, persisted to
  `localStorage["cards_theme"]`). Suits are always `S/H/D/C` internally —
  no game's logic depends on the active theme.
- Card faces: numeric cards (2-10, Ace) show a suit pip; Jack/Queen/King
  show a hand-drawn chicken portrait (`faceArt`) — a cockerel jack, hen
  queen, rooster king for the five "earthbound" themes, and a fully
  distinct helmet/visor/jetpack portrait (`spaceArt`) for the Space
  Chicken theme. The earthbound body uses `currentColor` so it always
  takes the card's red/black suit colour.
- **Suit glyphs AND suit colour on the card itself are always the
  classic ♠♥♦♣ in classic red/black** — see `Cards.SUIT_SYMBOL`,
  `Cards.SUIT_RED`, `Cards.SUIT_BLACK`. Deck themes never override
  either; only the K/Q/J portrait and the card back change per theme
  (see "Most recent pass").

## Most recent pass

**Player feedback: "when i said the KQJ should be different for each set
I meant the actual image of the chicken should be different, not just to
add the design from the back of the card. We also need a space chicken
set."** Two changes:

1. `accessoryArt(kind, hx, hy, hr)` rebuilt: the previous small corner
   badge is now real head-mounted headwear — a straw hat with brim
   (Barnyard), a straw-nest wreath ring (Coop), sunglasses with rays
   (Sunny Side), a fan of leaves (Orchard) — sized and positioned from
   each rank's actual head coordinates so it reads as part of the
   portrait, not an accent.
2. New 6th theme, `"space"` (Space Chicken): its `face.space` flag routes
   `faceArt()` to a new `spaceArt(rank)` function instead of the shared
   earthbound body — a round helmet, visor rim/fill, suit body, jetpack
   glow, and a rank-specific visor badge (crown/tiara/star for K/Q/J) —
   a genuinely different silhouette, not a recolour.

Earlier: **player feedback: "the suit colors should be standard red and black for
all card sets."** Suit colour used to be per-theme too (Barnyard's suits
were orange/dark-brown, Sunny Side's amber/navy) — every theme now
applies the same fixed `SUIT_RED`/`SUIT_BLACK` via the `--card-red`/
`--card-black` CSS vars, a natural follow-up to the suit-glyph fix below.
The per-theme `red`/`black` fields are gone from `THEMES` entirely.

Earlier: **player feedback: "ok i like the new card sets but the suits need to
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
