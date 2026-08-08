# Threes (threes) — per-game handoff

A Threes clone: slide tiles one step per move (never a full slam like
2048), 1+2=3, then equal 3+ tiles double (3+3=6, 6+6=12…), aiming for the
highest score.

## What's here

- `index.html` — everything. `window.__threes` exposes `slideLine`,
  `canMerge`, `merged` for headless testing. Uses `/arcade.js` for
  `Arcade.stats.record("threes", s)`.
- True Threes merge rules via `canMerge`/`merged`: a 1 only merges with an
  adjacent 2 (and vice versa) to make 3; from 3 upward, only two *equal*
  tiles merge, doubling. This is enforced per-line in `slideLine`, which
  moves each tile at most one cell toward the edge per move (Threes'
  signature "no full slide" behavior), unlike 2048-style games in this
  repo (fibonacci, dropmerge) that let tiles slide/cascade freely.
- The next tile to spawn (`genNext`) is weighted 45%/45%/10% toward
  1/2/3, shown in a HUD preview before it's placed on the edge opposite
  the swipe direction of a random line that actually moved.
- Score isn't a running counter — `score()` recomputes total score from
  the board every move via `tileScore()`, which maps tile value to
  3^(k+1) for tiles ≥3 (1s and 2s score 0).
- Best score persisted to `localStorage["threes_best"]`. No admin config
  pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
