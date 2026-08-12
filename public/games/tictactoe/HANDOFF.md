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

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
`minimax()` already had a one-line header comment but nothing
explaining its `10-depth`/`depth-10` scoring — added a note on why
subtracting/adding depth isn't just tie-breaking noise: it makes the
AI prefer the fastest available win and the slowest available loss
among otherwise-equal outcomes, not just any win/loss. Comment-only —
no logic touched; existing `tictactoe-unbeatable-test.js` (300
randomized games, human never wins) still passes unchanged.
Live-verified: deployed, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
