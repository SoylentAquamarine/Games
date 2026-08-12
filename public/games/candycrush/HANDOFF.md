# Chicken Match (candycrush) — per-game handoff

Match-3: swap two adjacent chicken heads to line up 3+ of the same color,
reach the target score before moves run out.

## What's here

- `index.html` — everything. `window.__cc` exposes the pure sim (`gen`,
  `findMatches`, `collapse`, `SIZE`, `NCOL`) for headless testing.
- 8x8 board (`SIZE=8`), 6 colors (`NCOL=6`). Each tile is a small inline
  SVG chicken head (`chickenSVG`) tinted per color via a `darken()` helper
  rather than a plain colored square.
- Board generation (`gen`) avoids pre-existing 3-in-a-rows/columns so the
  starting board has no free matches. Swaps that don't produce a match are
  reverted after a short delay with a "No match there." status message.
- Chain/cascade scoring: after a swap, `resolve()` repeatedly finds
  matches, clears them, collapses columns with `collapse()` (refilling
  from the top with new random tiles), and re-checks — each successive
  cascade step multiplies the per-tile score by an increasing `combo`
  counter.
- Fixed target of 1000 points in 25 moves (`TARGET`, `MOVES`, both in
  the `C` config object); game ends in a win or "out of moves" state.

## Most recent pass

Bug-hunt pass: the board had no deadlock protection. `gen()` only avoids
matches that already exist at generation time — nothing ensured a legal
swap still existed after `collapse()` refilled cleared cells with fresh
random colors, so the board could organically go "dead" (zero adjacent
swaps produce any match) well before the 25 moves ran out. Since a
non-matching swap reverts and does *not* cost a move, a dead board froze
the game permanently — confirmed via a 1000-game headless simulation
(random legal play), which hit a dead board in 19/1000 games, at move
indexes as early as move 6. Fixed by adding `hasValidMove(b)` (checks
every adjacent swap for a resulting match) and a `freshBoard()` helper
that regenerates via `gen()` until at least one legal move exists; used
both for the initial board in `newGame()` and as a mid-game recovery in
`trySwap()` — after each resolve, if the board has gone dead the game
reshuffles it (no move cost) with a "No moves left — board reshuffled."
status instead of silently locking up. Re-ran the same simulation with
the reshuffle path active across 2000 games: 27 reshuffles triggered, 0
games ended up stuck. `hasValidMove` is now also exposed on
`window.__cc` alongside the existing pure-sim exports.

## Admin config

`/admin/games/?game=candycrush` — 2 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `TARGET` (score
needed to win), `MOVES` (moves allowed). Pulled out of a standalone
`const` into a mutable `C` object; an IIFE reads
`localStorage.candycrush_config` on load and overrides any matching
numeric key via an explicit allowlist. `window.__cc` exports `C`
alongside its existing pure-sim exports.

## Open / deferred

Nothing currently open for this game.
