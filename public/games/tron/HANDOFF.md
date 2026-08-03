# Chicken Tron (tron) — per-game handoff

Tron-style light-cycle game: leave a solid trail, force the opponent to
crash into a wall or a trail.

## What's here

- `index.html` — everything. `window.__tron` exposes the pure sim for
  headless testing.
- Three lives: a crash replays the same round rather than ending the run
  outright; the run only ends once all three are gone.
- Comment box input no longer leaks keystrokes (particularly spacebar)
  into the game's key handlers — a site-wide gate-input issue fixed here
  alongside other overlay-gated games.

## Most recent pass

Fixed the shared "Press Spacebar to Begin" gate eating spaces typed into
the comment box (`fix(gates): stop eating spaces typed into the comment
box`) — a cross-game fix, not tron-specific, but it landed in the same
commit as tron-specific work. Earlier: renamed to Chicken Tron with
readable colors and the three-lives/replay-round structure, alongside
Missile Command's opening sequence and a new board-games hub.

## Open / deferred

Nothing currently open for this game.
