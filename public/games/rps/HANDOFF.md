# Rock Paper Scissors (rps) — per-game handoff

Rock Paper Scissors against a CPU: first to 5 round wins takes the match,
with a running win-streak tracker.

## What's here

- `index.html` — everything. `window.__rps` exposes `CHOICES`, `EMOJI`,
  `beats`, `round`, `WIN_TARGET` for headless testing. Uses `/arcade.js`
  for `Arcade.stats.record("rps", streak)`.
- CPU picks uniformly at random (`CHOICES[Math.floor(Math.random()*3)]`)
  — no pattern-reading or adaptive strategy.
- Tracks a consecutive-win streak (`streak`), reset to 0 on any loss (a
  tie doesn't break it); best streak persisted to
  `localStorage["rps_best"]` and updated live on each new win.
- Controls: click a hand button, or keyboard R/P/S and 1/2/3.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
