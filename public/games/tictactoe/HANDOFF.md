# Tic-Tac-Toe (tictactoe) — per-game handoff

Standard 3x3 Tic-Tac-Toe with two modes: vs an unbeatable minimax
computer, or local 2-player.

## What's here

- `index.html` — everything. No `window.__` export — this game doesn't
  expose a pure sim for headless testing (grepped the file to confirm).
- The AI (`bestMove`/`minimax`) is a full unbeatable minimax search over
  all 9 cells with a depth-adjusted score (`10-depth` for a win,
  `depth-10` for a loss) so it prefers faster wins and slower losses —
  there's no difficulty setting, it always plays perfectly.
- Mode toggle (vs Computer / 2 Players) fully resets scores and relabels
  the scoreboard ("You (X)"/"CPU (O)" vs "Player X"/"Player O").
- Tracks a running scoreboard (X wins / O wins / draws) across rounds
  within a mode, reset only when switching modes.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
