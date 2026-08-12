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

## Most recent pass — bottom-row label off-canvas bug

**Player feedback (reported roughly 5 times): "I cannot see the bottom
row of text, the text for the bottom of the game board is off the
screen, you have to fix it."** An earlier pass already fixed labels
*overflowing sideways* into the neighbouring tile (`fillText`'s
`maxWidth` param), but this was a different bug in the same area: every
non-corner tile's label drew at a fixed downward offset
(`size/2+9`, "below the tile"). For the top row that pushes the label
inward toward the board centre — fine — but the bottom row's tiles
already sit at `y=H-PAD`, right against the canvas's own bottom edge, so
that same downward push sent the label's `y` (~436.5) past `H` (432)
entirely, off the visible canvas. Every property name along the bottom
edge was silently unreadable, which is exactly what 5 rounds of the same
comment were describing.

Fixed with a side-aware offset (`labelY`): flips to negative (upward,
inward) specifically for the bottom row (`side===0`); every other side's
label position is unchanged. Found and fixed the same class of bug while
in the area: house/hotel markers used a fixed *upward* offset, which by
the same logic would push the TOP row's markers above `y=0` — mirrored
the fix there too (`side===2` now draws its markers downward/inward).

One existing test (`chickenopoly-cardmodal-textfix-test.js`) had a
literal-source check tied to the old inline offset expression; updated
to match the new `labelY` shape. Added a new
`chickenopoly-bottomrow-label-test.js` that replicates the actual tile
layout math numerically (not just a source-text check) and proves every
row's label now lands within the canvas's `[0, H]` bounds — including a
sanity check confirming the *old* formula genuinely would have failed
the same assertion, so the test has real teeth. Live-verified: deployed,
confirmed the new offset expression is live, zero console errors.

## Earlier pass — 4-player online multiplayer

**Player feedback: "Prepare for multiplayer with 4 human players on 4
computers"**, clarified as "Turn-based (MP_GAMES engine)" and then, once
that engine turned out to be hard-wired for exactly 2 players, "Extend
MP_GAMES to support N players." Shipped as a real 4-seat online mode —
this game's local single-player `index.html` is untouched; the new mode
lives entirely server-side plus a new client page:

- **`src/index.js`** (site-wide Worker) gained a `chickenopoly` entry in
  `MP_GAMES` with `seats:["A","B","C","D"]` and its own `CO_*` pure-sim
  functions — a hand-ported mirror of this game's `window.__chickenopoly`
  engine (same `SPACES`/houses-and-hotels/jail/trading rules), NOT a
  shared import, so the two stay decoupled the same way Adventure's
  real-time co-op mirrors its solo sim in `src/adventure-coop.js`.
  Move types: `roll`, `buy`, `pass`, `build`, `trade_offer`,
  `trade_accept`, `trade_reject` — the last four are `freeMoveTypes`
  (usable off-turn, matching this game's own Trade/Build buttons which
  were never turn-gated either).
- The shared multiplayer pipeline (`handleMpChallenge`/`handleMpRespond`/
  `handleMpMatch`/`handleMpMove`, `handleMpLobby`) was generalized to
  support any seat count via `eng.seats` (defaults to `["X","O"]`, so
  all 8 pre-existing 2-player games are byte-for-byte unaffected) and
  multi-recipient challenges that need every invitee to accept before the
  match starts. See root `HANDOFF.md` § Multiplayer engine for the full
  writeup.
- **Fixed the flat-utility-rent bug during the port** (see "Open /
  deferred" below for how it still stands in the single-player game):
  the new `coMovePlayerBy` threads the real dice total through to
  `coLandOn` from the start, so multiplayer utility rent is always
  `diceTotal*4`, never the single-player's flat "as if you rolled a 7."
- New client: `public/play/match/index.html` gained a `chickenopoly`
  board renderer (a 9x9 CSS grid ring of the 28 spaces, player chips,
  dice/roll/buy/pass, an inline Build panel, and an inline Trade
  proposal/accept/reject panel) alongside the existing 2-player game
  renderers. `public/play/index.html`'s lobby switched from "pick one
  opponent, challenge them" to a game-aware picker: choosing a 4-seat
  game asks you to check 3 opponents before the Challenge button enables.
- Tested via `chickenopoly-mp-test.js` (drives the real
  `src/index.js` through Node's ESM loader with an in-memory KV mock —
  register→challenge→multi-accept→match→moves end to end, the utility-
  rent fix with `Math.random` pinned for a deterministic roll, and a
  regression pass confirming all 8 existing 2-player `MP_GAMES` engines
  are unaffected), plus `play-lobby-multiseat-test.js` and
  `play-match-chickenopoly-test.js` for the two client pages.

## Earlier pass — board size fix

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

**Two bugs confirmed (not player-reported) in a bug-hunt pass across the
`board/` sub-games, both still present in the SINGLE-PLAYER `index.html`
only** — the new multiplayer mode above ported the rules fresh and does
not have either issue:

1. **Utility rent is always a flat $28**, regardless of the actual dice
   roll, on a normal turn. `landOn()` computes `rent=(diceTotal||7)*4`,
   but `movePlayerBy()` — the path every ordinary roll takes — never
   passes `diceTotal` through, so `landOn()` always falls back to the
   hardcoded `7`. `doRoll()` tries to "correct" this afterward by
   charging `roll.total*4` again, but that's a SECOND charge on top of
   the first flat $28, not a replacement — so a normal roll onto an
   opponent's utility double-charges the player (and double-pays the
   owner). Jail-escape utility landings, which skip `doRoll()`'s
   correction entirely, only get the wrong flat $28 with no second
   charge.
2. **The same "New Game doesn't cancel in-flight timers" bug fixed in
   `candyland`/`gameofchicken`/`sorry`/`trouble` this pass** (see the
   shared `board/HANDOFF.md`) is also present here — `startNewGame()`
   reassigns state to a fresh object but never cancels any `setTimeout`
   still pending from `endTurn`/`afterLanding`/a buy-or-pass prompt.

Repro scripts for both (not committed, not part of the regression
suite): scratchpad's `chickenopoly-utility-rent-test.js`.

**Multiplayer follow-ups not attempted this pass** (functional as shipped,
but worth revisiting): the offering side of a pending trade can cancel it
(`trade_reject`, usable by either `from` or `to`), but there's no
"counter-offer" flow — a rejected/cancelled trade has to be re-proposed
from scratch. Bankruptcy currently just returns everything to the bank
(same simplified rule as single-player) rather than transferring to
whoever bankrupted them.
