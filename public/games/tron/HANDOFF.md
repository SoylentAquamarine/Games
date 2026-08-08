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

**Bug fix (found in a code-review pass, not player-reported): a head-on
crash into the CPU wrongly counted as a win.** `tick()` computed `yDead`
purely from the pre-move occupancy grid, so when both riders steered into
the same still-empty cell in the same tick (a textbook head-on crash),
only `cDead` picked up the same-target-cell case — `yDead` stayed false
since that cell hadn't been marked occupied yet. A genuine mutual crash
was scored as "CPU crashed, you survive" instead of the draw `end()`
already has explicit handling for. Fixed by computing a shared `headOn`
flag and OR-ing it into both `yDead` and `cDead` so a same-cell collision
kills both riders symmetrically.

Earlier: fixed the shared "Press Spacebar to Begin" gate eating spaces
typed into the comment box (`fix(gates): stop eating spaces typed into
the comment box`) — a cross-game fix, not tron-specific, but it landed in
the same commit as tron-specific work. Earlier still: renamed to Chicken
Tron with readable colors and the three-lives/replay-round structure,
alongside Missile Command's opening sequence and a new board-games hub.

## Open / deferred

Nothing currently open for this game.
