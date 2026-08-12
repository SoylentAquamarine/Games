# Chicken Checkers (checkers) — per-game handoff

Standard checkers: forced captures, chain jumps, kinging, full undo.

## What's here

- `index.html` — everything. `window.__checkers` exposes the pure sim
  (`newBoard`, `genMoves`, `applyMove`, `capsFrom`, `chainLen`).
- Full undo support and animated moves.

## Most recent pass — king pieces drop the chicken face

**Player feedback: "no the king checker needs to not have a chicken on
it and just a big crown."** A king used to get the same chicken face
as every regular piece, PLUS a crown drawn across it — the two
competed for the same small space. `piece()` now skips `chickenFace()`
entirely for kings (`if(!isKing(v)) chickenFace(...)`); the existing
crown (already sized big and bold from the earlier pass below) is the
only decoration a king gets. Pure rendering change, no game-logic
touched — verified via the existing 300-random-game simulation test
(still passes) plus a clean page-load console check.

## Earlier pass

Bolder king crown — the previous one was too subtle to read at a glance
which pieces were kinged. Earlier: rebuilt from scratch as Chicken
Checkers with animation and full undo (this was the original
implementation pass, not an iteration on a prior version).

## Open / deferred

Nothing currently open for this game.
