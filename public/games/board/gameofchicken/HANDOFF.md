# The Game of Chicken (board/gameofchicken) — per-game handoff

Game of Life-style career board: spin, walk the lane, hit payday/family/
event tiles, retire — biggest nest egg at The Coop wins.

## What's here

- `index.html` — everything. `window.__gameofchicken` exposes the pure sim
  (`N`, `CAREERS`, `tileType`, `spin`, `newPlayer`, `applyTile`,
  `movePlayer`, `finalScore`, `allRetired`, `FAMILY_BONUS`, `START_CASH`,
  `C`) for headless testing.
- Single local device, 4 seats (`NP=4`): you plus 3 CPU players that
  auto-spin on their own turn after a short pause.
- Landing on a tile applies its effect immediately (`applyTile`): payday
  pays your career's salary, family adds a chick (worth `FAMILY_BONUS` at
  the end), a `+`/`-` event tile swings your cash by a random amount from
  a themed pool, and the last tile retires you. `finalScore` is cash plus
  chicks × `FAMILY_BONUS` — biggest score once everyone's retired wins.
- **Admin-configurable** at `/admin/games/?game=board/gameofchicken`:
  `RESULT_DELAY` (see "Most recent pass"). Uses the site's generic
  numeric-knob config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["board/gameofchicken_config"]`, merged into `C` at boot
  via an explicit allowlist. Note the slug (and therefore both the
  `NUMERIC_CONFIGS` key and the `storageKey`) contains a literal `/`,
  same as the game's own folder path — `NUMERIC_CONFIGS["board/
  gameofchicken"]` needs bracket/quoted syntax, not the bare
  `identifier:{...}` shorthand every slash-free game uses.

## Most recent pass — test-hygiene: fix the stale-timer regression test

`gameofchicken-newgame-stale-timer-test.js` (scratchpad-only, per the
convention noted below and in `board/chickenopoly/HANDOFF.md`) was
originally written to *reproduce* the New-Game-doesn't-cancel-in-flight-
timers bug — its final check was literally named "BUG CONFIRMED: the
stale timer auto-spun for the human player right after New Game." That
bug was fixed in commit `e7ceb89` (the `gen`-counter guard, see `doSpin`/
`advance`), but nobody went back and updated the test afterward, so its
"BUG CONFIRMED" assertion had been silently failing ever since — flagged
but left alone in the pass below. Rebuilt the test's harness (a
`vm.runInContext` sandbox with mocked DOM/canvas/timers, driving a real
human spin → CPU-turn timer → New Game → firing the now-stale CPU timer)
and flipped the assertion to match the CURRENT correct behavior: the
stale timer must be a no-op after New Game. Verified the new test has
real teeth by running it against the pre-`e7ceb89` commit, where the same
assertion fails as expected (i.e. it does catch the original bug), and
against current `index.html`, where it passes. No game code changed —
this was test-only.

## Earlier pass — result-delay config (8s tile-result reveal)

**Player feedback: "when you draw a card and it says what the card says,
that has to delay for at least 10 seconds so i can see what it says, it
is floating past too fast. maybe 8 seconds. should be adjustable through
the config page."** ("card" here means an event/payday/family tile's
result text, not a literal playing card — this game has no cards.) The
result text (`statusEl.textContent=PNAMES[turn]+": "+result.text;`) used
to show for a flat 650ms before `advance()` overwrote it with the next
player's turn banner — nowhere near enough time to read something like
"A fox raided the coop: -$600." Extracted the literal `650` into
`C.RESULT_DELAY`, raised the default to 8000ms (the player's own
suggested value), and registered it as an admin-configurable knob (range
500-15000ms) so anyone who wants it faster or slower can dial it in
themselves, per the explicit "should be adjustable" ask.

Verified against the existing `gameofchicken-test.js` (13 checks, pure
sim logic — unaffected, still passes) and
`gameofchicken-newgame-stale-timer-test.js` — the latter's final
"BUG CONFIRMED" assertion already failed against the pre-this-session
committed source (the game's `gen`-counter guard already prevents the
stale-timer bug the test was written to reproduce; the test itself was
just out of date — fixed in the pass above). Flagged separately rather
than silently worked around. Live-verified: deployed, confirmed
`C.RESULT_DELAY` defaults to 8000 and the admin override applies, zero
console errors.

## Open / deferred

- No HANDOFF.md existed for this game before this pass — created one now.
  `board/candyland`, `board/sorry`, and `board/trouble` are still missing
  theirs (only `board/chickenopoly` had one) — worth a follow-up
  documentation pass across the rest of the board-games hub.
