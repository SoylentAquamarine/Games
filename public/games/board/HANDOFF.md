# Board Games hub (board) — per-game handoff

The `board/` folder is a container for standalone board-game reskins —
there is no `board/index.html` of its own (unlike the `musicmaker/` hub,
which has a landing page). Players reach each sub-game directly via its
own URL, and each is listed as its own entry in `public/games/INDEX.md`.

## What's here

- No `index.html` at this level — only sub-folders, each a fully
  independent game:
  - `board/candyland/index.html` — "Chickenland," a Candy Land-style race
    to the barn.
  - `board/chickenopoly/index.html` — "Chickenopoly," a Monopoly clone.
    Already has its own `HANDOFF.md` (see
    `public/games/board/chickenopoly/HANDOFF.md`) with a much fuller
    per-game history.
  - `board/gameofchicken/index.html` — "The Game of Chicken," a Game of
    Life-style clone (spin, retire, biggest nest egg wins).
  - `board/sorry/index.html` — a Sorry!-style card-draw race game.
  - `board/trouble/index.html` — a Trouble-style Pop-o-Matic race game.
- The root `HANDOFF.md`'s frontend-structure listing describes
  `games/board/` as "candyland, trouble, sorry, index (hub)" — that
  `index (hub)` reference is stale; no such file exists in this folder
  today. `gameofchicken` and `chickenopoly` aren't mentioned there either.
  This HANDOFF.md reflects the actual current folder contents, not that
  older description.
- No admin config pane wired up at the `board` level (each sub-game would
  need its own, if any).

## Most recent pass

**Bug fixes (found in a bug-hunt pass, not player-reported) in four of
the five sub-games — the same bug class in each:**

`newGame()` reset a game's state but never cancelled any `setTimeout`
still in flight from the PREVIOUS game's turn sequence (card-read
delays, CPU-turn auto-advance/auto-spin/auto-draw, hop animations).
Since every deferred callback was only guarded by `if(!over)` — and
`newGame()` resets `over` back to `false` — a stale timer from before a
restart could fire on the freshly reset game: silently moving a pawn,
auto-spinning/auto-drawing on the human player's behalf, or otherwise
acting with no click. Fixed identically in `candyland`, `gameofchicken`,
`sorry`, and `trouble`: a `gen` generation counter, bumped once at the
top of `newGame()`, snapshotted (`const g=gen`) before each `setTimeout`
is scheduled, and checked (`g===gen`) inside the callback before it
acts. `sorry` and `trouble` each had 4 separate `setTimeout` call sites
needing the guard; `candyland` and `gameofchicken` had 2 each.

`board/chickenopoly` has the same latent bug (`startNewGame()` doesn't
cancel in-flight timers either) — **confirmed but deliberately left
unfixed** in this pass, along with a second, unrelated confirmed bug
found in the same review: utility rent is always charged a flat $28
regardless of the dice roll on a normal turn (`movePlayerBy()` never
passes the roll's total through to `landOn()`'s rent calculation, which
falls back to a hardcoded `7`), and `doRoll()`'s attempt to correct this
afterward charges the *correct* amount again on top rather than
replacing the wrong one — so a normal roll onto an owned utility
double-charges the player. Both are tracked in
`public/games/board/chickenopoly/HANDOFF.md`'s "Open / deferred"
rather than fixed here, since that game already has a separate,
explicitly-deferred player request (multiplayer networking) and a
larger, more careful pass made sense to do together.

Earlier: **bug fixes (found in a code-review pass, not player-reported) in two
sub-games:**

- **`sorry`** — a slide could carry a pawn past another pawn resting on
  the slide's own first square without bumping it. `resolveLanding()`'s
  slide-clearing loop ran from `sl.start+1` to `sl.end`, skipping
  `sl.start` itself. A pawn of the slide's own color is legitimately
  immune to triggering that slide and can rest exactly on `sl.start` — a
  normal, reachable square. Landing there with a different-color pawn
  should bump the resting pawn like any other landing, before riding the
  slide onward, but the off-by-one skipped that square entirely. Fixed
  by starting the bump loop at `sl.start` (excluding the mover itself).
- **`candyland`** — a 3-way mud-skip cascade could hand the mover an
  extra turn. `advance()`'s skip-search loop was bounded to exactly 3
  iterations (one per player), enough when at most 2 of 3 players are
  simultaneously flagged "stuck in mud." But if all 3 land in mud on 3
  consecutive turns — reachable in a normal game — the loop exhausts its
  3 iterations, clears every flag along the way, and lands back on
  whichever player just moved, silently giving them an unearned repeat
  turn instead of skipping anyone. Fixed by extending the loop by one
  iteration so the cascade resolves onto the next player in sequence.

Earlier: no player-feedback pass yet at the hub level — this HANDOFF.md
was created as part of a documentation sweep (see the root HANDOFF.md's
"Per-game HANDOFF.md rollout" note). Individual sub-games (notably
`chickenopoly`) have had their own passes — see their own HANDOFF.md
files.

## Open / deferred

`board/chickenopoly` has a live, explicitly deferred player request for
4-player human multiplayer across 4 computers (real-time networking) —
see the "Open / deferred" section of
`public/games/board/chickenopoly/HANDOFF.md` for the full note. Not
addressed here; flagging its existence only.
