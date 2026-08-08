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

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
