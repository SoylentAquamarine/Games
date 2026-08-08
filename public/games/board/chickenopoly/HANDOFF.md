# Chickenopoly — per-game handoff

Monopoly-style board game: 28-space square board (7/side), 4 players (you
+ 3 CPUs), classic buy/rent/jail/bankruptcy rules re-skinned with chickens.

## What's here

- `index.html` — everything. `window.__chickenopoly` exposes the pure sim
  (`newGame`, `rollDice`, `movePlayerBy`, `landOn`, `resolveBuy`,
  `cpuShouldBuy`, `takeJailTurn`, `validateTrade`, `cpuShouldAcceptTrade`,
  `executeTrade`, `SPACES`, `C`-equivalents).
- `SPACES` is the board definition (28 entries: properties/railroads/
  utility/tax/chance/chest/corners) — colour groups drive both rent
  doubling (`ownsFullGroup`) and the tile colour on the canvas.
- CPU buy rule (`cpuShouldBuy`): buys if it can afford the property and
  still keep a $150 cash cushion.
- **Houses & hotels**: `s.houses[idx]` is 0-4 real houses, or `5` meaning
  a hotel. `s.bank.houses`/`s.bank.hotels` is a shared pool across ALL
  players (classic 32/12), not per-player — see `canBuild()`/
  `buildHouse()`. Build-evenly is enforced by `canBuild()` checking the
  target property's house count against the minimum across its whole
  group — you can only improve whichever property(ies) are currently
  least-developed. `propertyRent()` uses `RENT_TIER_MULT` once a
  property has ≥1 house; at 0 houses it falls back to the pre-existing
  unimproved/full-group-doubled behavior unchanged.

## Most recent pass — board size fix

**Player feedback: "the board is way too small and the words for the
properties are cut off."** The two flanking player columns (118px each,
added in the "player panels + trading" pass below) plus their gaps
already ate up to 256px of the old 560px page-wrap budget, leaving only
~304px for a board whose canvas is natively 432px — the whole board
(tile labels included) rendered scaled down to ~70% of its intended size
via the canvas's own `width:100%` CSS, which read as illegibly
cramped/cut-off text. Widened the page wrap from 560px to 700px so the
board can reach close to its native 432px width even with both player
columns present.

## Earlier pass — build houses & hotels

Player feedback: "add the build houses and hotels features, count the
houses and hotels in the original monopoly and don't let people build
more houses than there are available." New `🏠 Build` button/modal for
the human, listing every owned property with its current house count and
either a Build button (with cost) or the specific reason it can't be
built right now (bank out of houses/hotels, needs to build evenly
elsewhere first, group not fully owned, can't afford it). CPUs get a
simple building heuristic (`cpuMaybeBuild`, same $150 cash-cushion spirit
as `cpuShouldBuy`) called once at the end of their own turn — houses
aren't human-only. Bankruptcy (`checkBankrupt`) now also returns any
houses/hotels on the lost properties to the bank pool, not just the
properties themselves. Small green house / red hotel markers drawn above
improved tiles on the board.

## Earlier pass — tile-label overflow fix + chance/chest card modal

Two player comments:

1. **"the text is bleeding off, make sure it is all visible on the
   board"** — tile labels (property name sliced to 9 chars) had no width
   constraint; a bold/wide-character name could still render wider than
   the gap between tile centres and overlap the neighbour. Fixed with
   `fillText`'s `maxWidth` param, which makes the canvas compress the
   glyphs to fit instead of trying to out-guess character widths per
   font/string — see the `maxW` computation right before the tile-label
   `fillText` call in `render()`.
2. **"when someone lands on chance or community chest I can't tell
   what's going on, we need to see a card in the middle of the board for
   10 seconds"** — `landOn()` already resolved the drawn card's effects
   (via `card.fx`) but only ever returned a combined status-bar string.
   Now also returns `cardType`/`cardText`; `afterLanding()` routes those
   through a real modal (`#cardModal`) instead of the normal flow,
   auto-dismissing after 10s or immediately via a Continue button.
   Applies to every player's turn, not just the human's — a CPU landing
   on chance/chest also pauses to show its card.

## Earlier pass — player panels + trading

Player panels moved from a row above the board to two columns flanking it
(2 left, 2 right — `.playersLeft`/`.playersRight` either side of
`.board-col`), and each panel now lists every property that player owns by
name (colour-dotted by group) instead of just a count.

Added a Trade button/modal: "You" (player 0) can propose swapping
properties and/or cash with any other active player. `validateTrade`
checks ownership/cash are real before anything happens; CPUs decide via
`cpuShouldAcceptTrade` — accepts if what they'd receive is worth at least
~90% of what they'd give up and they can cover any cash requested.
`executeTrade` does the actual prop/cash transfer both directions.

## Open / deferred

**"Prepare for multiplayer with 4 human players on 4 computers"** —
explicitly NOT attempted this pass. This is a much larger, separate
undertaking than the local UI work above: it would need either porting
this into the site's turn-based `MP_GAMES` engine (see root `HANDOFF.md`
§ Multiplayer engine) or a real-time Durable Object room like Adventure
co-op, plus a `redact()` hook so each player's hand of property/cash info
stays appropriately visible/hidden. Needs design input on which transport
fits a 4-player board game with variable-length turns before starting.
