# Klondike Solitaire — per-game handoff

Standard Klondike (draw-3) built on the shared `../cards.js` engine, with
a Standard and a Vegas rules mode.

## What's here

- `index.html` — everything. Exposes `window.__klondike` with the pure
  move predicates (`sv`, `isRed`, `foundationOk`, `tableauOk`, `DEAL`,
  `VEGAS_PASSES`) for headless testing; the rest of the game state
  (`board`/`stock`/`waste`/`found`/`tab`, `newGame`, `drawStock`, `tryTo`,
  etc.) lives in the closure and isn't exported.
- Standard mode: draw 3 at a time, unlimited redeals (stock recycles from
  waste via `waste.reverse()`, which correctly reproduces the original
  draw-3 grouping order on the next pass).
- Vegas mode: -$52 buy-in, +$5 per card sent to a foundation, -$5 per
  card pulled back off a foundation to the tableau, 3 total passes
  through the stock (`VEGAS_PASSES = 2` redeals + the initial pass). A
  completed or abandoned (New Deal / mode switch) Vegas game always
  commits its running score into the persistent `bank` (localStorage
  `klondike_bank`), tracked via a `committed` flag so a game's score is
  only ever banked once.
- Double-tap a card (detected by click timing, not a `dblclick`
  listener, since the first click's re-render destroys the element a
  `dblclick` would have fired on) sends it to its foundation if legal.
  "Auto to foundations" repeatedly sweeps every eligible top card from
  waste/tableau to foundations until none are left.
- "💰 Reset bankroll" zeroes the persisted bankroll (with a `confirm()`
  guard) — only shown in Vegas mode.

## Most recent pass

**Bug fix:** `resetBank()` force-set `committed = true` whenever the
bankroll was reset, which silently suppressed the *next* legitimate
`commitScore()` call. Concretely: start a Vegas game (score starts at
-$52, uncommitted), click "Reset bankroll" mid-game, then end that game
via New Deal (or a win) — normally ending a Vegas game always commits
its score into the bankroll, but with the bug the pending -$52 (or
whatever the game's final score was) vanished instead of being added,
because `committed` had already been falsely marked `true`. Fixed by
dropping the `committed = true` line from `resetBank()` — it now only
zeroes `bank`, leaving `committed` to reflect reality so the
in-progress game's score still commits normally when it ends. Verified
with a headless regression test driving the real button click
handlers via a mocked DOM (loads `cards.js` + this game's inline
script into one `vm` context): before the fix, bankroll stayed `$0`
after Reset → New Deal; after the fix it correctly shows `-$52`.

Earlier: no prior pass — this HANDOFF.md did not exist before (unlike
most other games' folders, individual `public/games/cards/*` games
don't have their own HANDOFF.md; only the shared
`public/games/cards/HANDOFF.md` documents `cards.js` itself). Created
as part of a bug-hunt pass across `simon`, `tictactoe`, `ultimatettt`,
`mancala`, `rps`, `chutes`, `maze`, `stack`, `stratego`, and this game.

## Open / deferred

Nothing currently open for this game.
