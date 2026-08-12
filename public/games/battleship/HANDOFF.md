# Battleship (battleship) — per-game handoff

Classic Battleship: place your fleet, call shots against the CPU's
hidden grid, sink every ship to win.

## What's here

- `index.html` — everything. No `window.__` pure-sim export; not yet set
  up for headless testing the way most other games are.
- Added in the same original batch as Mastermind, Frogger, Pac-Man, and
  Yahtzee.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
`aiTurn()` had only two terse inline labels ("target mode" / "hunt:
random parity untried") — expanded into a full explanation of the
classic Battleship-solving hunt/target AI: target mode drains a queue
of cells adjacent to a confirmed hit before falling back to hunt mode,
which restricts random guesses to one checkerboard parity (since every
ship is ≥2 cells and adjacent cells always differ in parity, one color
alone still guarantees finding every ship, at roughly half the
guesses). Comment-only — no logic touched; existing
`battleship-probe.js`/`battleship-probe-random.js` still pass
unchanged. Live-verified: deployed, zero console errors.

## Earlier pass

No dedicated feedback pass yet beyond the original build and the
site-wide comments-widget rollout.

## Open / deferred

- **No `window.__battleship` test export** — worth adding if this game
  gets a future gameplay pass.
