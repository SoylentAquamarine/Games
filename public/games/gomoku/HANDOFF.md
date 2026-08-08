# Gomoku (gomoku) — per-game handoff

Five-in-a-row on a 13x13 board against a CPU: place stones, first to
five in a row (any direction) wins.

## What's here

- `index.html` — everything, canvas-based board. `window.__gomoku`
  exposes the pure sim (`emptyBoard`, `win`, `cellScore`, `aiMoveOn`, `N`)
  for headless testing.
- 13x13 grid (`N=13`). The CPU AI (`aiMove`) scores every empty cell
  adjacent to existing stones (`near()`, within a 5x5 window of any played
  stone — the board center is used only as a first-move fallback) by
  combining its own offensive potential (`cellScore(...,W)`) with a
  weighted defensive score against the human's lines
  (`0.95*cellScore(...,B)`), using a hand-tuned pattern table (`pat()`)
  that heavily rewards open-ended 3s and 4s.
- The CPU's most recent placement is marked with a small red dot overlay
  on the board so the player can spot it at a glance.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
