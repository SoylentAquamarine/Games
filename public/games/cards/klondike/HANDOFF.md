# Klondike Solitaire — per-game handoff

Standard Klondike (draw-3) built on the shared `../cards.js` engine, with
a Standard and a Vegas rules mode.

## What's here

- `index.html` — everything. Exposes `window.__klondike` with the pure
  move predicates (`sv`, `isRed`, `foundationOk`, `tableauOk`, `DEAL`,
  `VEGAS_PASSES`, `C`) for headless testing; the rest of the game state
  (`board`/`stock`/`waste`/`found`/`tab`, `newGame`, `drawStock`, `tryTo`,
  etc.) lives in the closure and isn't exported.
- Standard mode: draw `C.DEAL` (default 3) at a time, unlimited redeals
  (stock recycles from waste via `waste.reverse()`, which correctly
  reproduces the original draw-grouping order on the next pass).
- Vegas mode: -$52 buy-in, +$5 per card sent to a foundation, -$5 per
  card pulled back off a foundation to the tableau, `C.VEGAS_PASSES+1`
  total passes through the stock (`C.VEGAS_PASSES` redeals + the
  initial pass, default 2 redeals = 3 total). A completed or abandoned
  (New Deal / mode switch) Vegas game always commits its running score
  into the persistent `bank` (localStorage `klondike_bank`), tracked
  via a `committed` flag so a game's score is only ever banked once.
- **Admin-configurable** at `/admin/games/?game=cards/klondike`:
  `DEAL`, `VEGAS_PASSES`. Uses the site's generic numeric-knob config
  pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["cards/klondike_config"]`, merged into `C` at boot via
  an explicit allowlist. `DEAL`/`VEGAS_PASSES` stay as plain identifiers
  throughout the rest of the file, just sourced from `C` instead of
  hardcoded, so no other usage sites needed touching.
- Double-tap a card (detected by click timing, not a `dblclick`
  listener, since the first click's re-render destroys the element a
  `dblclick` would have fired on) sends it to its foundation if legal.
  "Auto to foundations" repeatedly sweeps every eligible top card from
  waste/tableau to foundations until none are left.
- "💰 Reset bankroll" zeroes the persisted bankroll (with a `confirm()`
  guard) — only shown in Vegas mode.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Explained the two core Klondike move rules encoded in `foundationOk()`
(same suit, exactly one rank above the pile's top, Ace on empty) and
`tableauOk()` (one rank below and opposite color, King on empty).
Comment-only — no logic touched; existing `klondike-resetbank-test.js`
still passes unchanged. Live-verified: deployed, zero console errors.

## Earlier pass — admin config

Added the admin config pane described above (`DEAL`, `VEGAS_PASSES`)
— no gameplay change to the defaults. Verified against the existing
`klondike-resetbank-test.js` (unaffected, still passes).

Earlier: **Bug fix:** `resetBank()` force-set `committed = true` whenever the
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
