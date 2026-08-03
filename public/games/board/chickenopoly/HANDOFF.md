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

## Most recent pass — tile-label overflow fix + chance/chest card modal

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

**"Build houses and hotels — count them like the original Monopoly and
don't let people build more than are available"** — not started. This
is a substantial mechanic addition: per-colour-group even-building rules
(can't add a 2nd house to one property in a group until every property
in that group has at least 1), house costs that vary by colour group,
a hotel replacing 4 houses at 5-houses-built, a shared bank pool capped
at the classic 32 houses / 12 hotels total (building can literally run
out for everyone, not just per-player), and extending `propertyRent`'s
rent table to the house-count tiers (currently only unimproved vs.
full-group-doubled). Needs its own pass, not a quick add-on.

**"Prepare for multiplayer with 4 human players on 4 computers"** —
explicitly NOT attempted this pass. This is a much larger, separate
undertaking than the local UI work above: it would need either porting
this into the site's turn-based `MP_GAMES` engine (see root `HANDOFF.md`
§ Multiplayer engine) or a real-time Durable Object room like Adventure
co-op, plus a `redact()` hook so each player's hand of property/cash info
stays appropriately visible/hidden. Needs design input on which transport
fits a 4-player board game with variable-length turns before starting.
