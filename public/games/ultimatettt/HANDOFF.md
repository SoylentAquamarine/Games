# Ultimate T-T-T (ultimatettt) — per-game handoff

Ultimate Tic-Tac-Toe against a CPU: 9 small tic-tac-toe boards arranged
in a 3x3 meta-grid — the cell you play sends your opponent to the
matching small board next, and you win by taking 3 small boards in a row.

## What's here

- `index.html` — everything. `window.__uttt` exposes `winnerOf`, `full`,
  `newGameState`, `place`, `legalCount`, `setActive` for headless
  testing.
- `active` tracks which of the 9 small boards the current player is
  constrained to; if that board is already won/full, `legalMoves()` opens
  up every remaining playable board instead (`active` becomes -1). A
  small board is marked won (`bigWin[bi]`) on 3-in-a-row, or -1
  ("drawn/dead", distinct from 0/unplayed) once full without a winner —
  drawn boards are excluded from both the meta win-check and future legal
  moves.
- CPU (`aiMove`) scores each legal `(board, cell)` move: winning a small
  board is worth +40 (with a huge bonus if it also wins the whole meta
  game), blocking an opponent's small-board win is worth +25, and it
  penalizes sending the opponent to a board where they could immediately
  win it (`canWinBoard(ci,X)`) or to an unconstrained "play anywhere" free
  move — plus small centrality bonuses for the middle board/cell.
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Added an explanation of the signature (and famously confusing)
Ultimate Tic-Tac-Toe rule to `place()`: the CELL a player just played
in dictates which SUB-BOARD the opponent must play in next, falling
back to free choice if that sub-board is already decided or full.
Also documented `bigWin[bi]`'s three-state sentinel (0/won/-1 for
drawn) and `legalMoves()`'s use of the `active` restriction.
Comment-only — no logic touched; existing `uttt-sim-test.js` (200
randomized games checked against an independent reference
implementation) still passes unchanged. Live-verified: deployed, zero
console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
