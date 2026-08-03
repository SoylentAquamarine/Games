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

## Most recent pass — player panels + trading

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
