# Chicken Checkers (checkers) — per-game handoff

Standard checkers: forced captures, chain jumps, kinging, full undo.

## What's here

- `index.html` — everything. `window.__checkers` exposes the pure sim
  (`newBoard`, `genMoves`, `applyMove`, `capsFrom`, `chainLen`).
- Full undo support and animated moves.

## Most recent pass

Bolder king crown — the previous one was too subtle to read at a glance
which pieces were kinged. Earlier: rebuilt from scratch as Chicken
Checkers with animation and full undo (this was the original
implementation pass, not an iteration on a prior version).

## Open / deferred

Nothing currently open for this game.
