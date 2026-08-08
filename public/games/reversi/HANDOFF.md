# Reversi (reversi) — per-game handoff

Standard 8x8 Reversi/Othello against a CPU: flank the opponent's discs
between two of yours to flip them, most discs when the board fills wins.

## What's here

- `index.html` — everything. `window.__reversi` exposes the pure sim
  (`initBoard`, `legalMoves`, `applyMove`, `flipsFor`, `count`, `opp`) for
  headless testing.
- Legal moves are highlighted on the board (green dot overlay) whenever
  it's the human's turn; `flipsFor` checks all 8 directions for a
  sandwiched run of opponent discs.
- CPU (`cpu()`) evaluates each legal move with a static positional weight
  table (`WEIGHTS`, corners/edges weighted heavily positive, cells
  adjacent to corners weighted negative) via `evalBoard`, plus a small
  random jitter to avoid always picking the same move among ties — no
  minimax/lookahead beyond one ply.
- Handles forced passes correctly: if the side to move has no legal move,
  play passes to the other side with a status message; if *neither* side
  has a legal move, the game ends immediately.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
