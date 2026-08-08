# Lights Out (lightsout) — per-game handoff

Classic Lights Out puzzle on a 5x5 grid: clicking a light toggles it and
its 4 orthogonal neighbors, goal is to turn every light off.

## What's here

- `index.html` — everything. No `window.__` export — this game doesn't
  expose a pure sim for headless testing (grepped the file to confirm).
- Puzzle generation (`newPuzzle`) always starts from the solved (all-off)
  grid and scrambles it with 6-13 random presses (`press`), which
  guarantees every generated puzzle is solvable (Lights Out presses are
  their own inverse) — it re-scrambles if the result happens to already
  be solved.
- Tracks a best (fewest-moves) solve in `localStorage["lightsout_best"]`,
  shown alongside the current move count and updated with a "New best!"
  message when beaten.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
