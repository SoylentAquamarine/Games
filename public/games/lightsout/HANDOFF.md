# Lights Out (lightsout) — per-game handoff

Classic Lights Out puzzle on a 5x5 grid: clicking a light toggles it and
its 4 orthogonal neighbors, goal is to turn every light off.

## What's here

- `index.html` — everything. `window.__lightsout` exposes just `C` (the
  admin-tunable difficulty knobs below) — not a full pure-sim export.
- Puzzle generation (`newPuzzle`) always starts from the solved (all-off)
  grid and scrambles it with `C.SCRAMBLE_MIN` to
  `C.SCRAMBLE_MIN+C.SCRAMBLE_RANGE-1` random presses (`press`), which
  guarantees every generated puzzle is solvable (Lights Out presses are
  their own inverse) — it re-scrambles if the result happens to already
  be solved.
- Tracks a best (fewest-moves) solve in `localStorage["lightsout_best"]`,
  shown alongside the current move count and updated with a "New best!"
  message when beaten.
- **Admin-configurable** at `/admin/games/?game=lightsout`:
  `SCRAMBLE_MIN`, `SCRAMBLE_RANGE` (together set how many random presses
  scramble a fresh puzzle — more presses generally means a harder-to-see
  solution path). Uses the site's generic numeric-knob config pattern
  (see kaboom's HANDOFF.md) — saved to `localStorage["lightsout_config"]`,
  merged into `C` at boot via an explicit allowlist. `N` (grid size)
  stays fixed — this is specifically a 5x5 Lights Out puzzle.

## Most recent pass

Added the admin config pane described above (`SCRAMBLE_MIN`,
`SCRAMBLE_RANGE`) — no gameplay change to the defaults.

Earlier: no player-feedback pass yet — this HANDOFF.md was created as
part of a documentation sweep (see the root HANDOFF.md's "Per-game
HANDOFF.md rollout" note). Everything under "What's here" reflects the
game as originally built.

## Open / deferred

Nothing currently open for this game.
