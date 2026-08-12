# Threes (threes) — per-game handoff

A Threes clone: slide tiles one step per move (never a full slam like
2048), 1+2=3, then equal 3+ tiles double (3+3=6, 6+6=12…), aiming for the
highest score.

## What's here

- `index.html` — everything. `window.__threes` exposes `slideLine`,
  `canMerge`, `merged`, `genNext`, `newGame`, `C` (spread flat too) for
  headless testing. Uses `/arcade.js` for `Arcade.stats.record("threes",
  s)`.
- True Threes merge rules via `canMerge`/`merged`: a 1 only merges with an
  adjacent 2 (and vice versa) to make 3; from 3 upward, only two *equal*
  tiles merge, doubling. This is enforced per-line in `slideLine`, which
  moves each tile at most one cell toward the edge per move (Threes'
  signature "no full slide" behavior), unlike 2048-style games in this
  repo (fibonacci, dropmerge) that let tiles slide/cascade freely.
- The next tile to spawn (`genNext`) is weighted 45%/45%/10% toward
  1/2/3 by default (`C.ONE_CHANCE`/`C.TWO_CHANCE`, admin-tunable — see
  below), shown in a HUD preview before it's placed on the edge opposite
  the swipe direction of a random line that actually moved.
- Score isn't a running counter — `score()` recomputes total score from
  the board every move via `tileScore()`, which maps tile value to
  3^(k+1) for tiles ≥3 (1s and 2s score 0).
- Best score persisted to `localStorage["threes_best"]`.

## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
`genNext()`'s spawn odds (were a hardcoded `r<0.45?1:r<0.9?2:3`) pulled
into a `C={ONE_CHANCE:0.45, TWO_CHANCE:0.45}` object with the standard
localStorage-override IIFE (`threes_config`, matching allowlist —
`TWO_CHANCE` is the share of the *remaining* probability after
`ONE_CHANCE`, so a 3 spawns whenever neither roll hits, same shape as
the original ternary chain). Deliberately did **not** expose `N` (the
4x4 grid) — definitional to Threes, not a difficulty dial, same call
made for 2048's `SIZE`. Registered in `/admin/games/`'s
`NUMERIC_CONFIGS`. New `threes-config-test.js` (7 checks) verifies the
default odds statistically match the original 45/45/10 split and that
an override shifts them. Existing `threes-invariant-test.js` (500,000
randomized line trials) still passes unaffected. Live-verified:
deployed, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
