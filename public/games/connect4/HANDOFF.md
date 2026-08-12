# Connect Four (connect4) — per-game handoff

Classic Connect Four: drop discs to build a 4-in-a-row before the
opponent does. CPU opponent (alpha-beta AI) or 2-player local.

## What's here

- `index.html` — everything. `window.__connect4` exposes just `C` (the
  admin-tunable difficulty knob below) — not a full pure-sim export.
- CPU opponent uses alpha-beta search (`feat(games): add Connect Four
  (alpha-beta AI + 2-player)`), not a random/heuristic-only bot.
- **Admin-configurable** at `/admin/games/?game=connect4`: `AI_DEPTH`
  (minimax search depth, default 5 — higher looks further ahead but
  is noticeably slower per move). Uses the site's generic numeric-knob
  config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["connect4_config"]`, merged into `C` at boot via an
  explicit allowlist, rounded to an integer (a fractional search depth
  doesn't mean anything).

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
`minimax()` had no comment on its alpha-beta pruning (`if (alpha >=
beta) break;`) or its depth-adjusted win/loss scoring — added an
explanation of why the pruning is provably safe (not an approximation)
and why 1000000±depth beats a flat score. Comment-only — no logic
touched; existing `connect4-block-test.js` (60 randomized games) still
passes unchanged. Live-verified: deployed, zero console errors.

## Earlier pass — admin config

Added the admin config pane described above (`AI_DEPTH`) — no gameplay
change to the default. Verified against the existing
`connect4-block-test.js` (60 randomized games, confirms the CPU still
blocks every unambiguous one-move win at the default depth).

Earlier: no dedicated feedback pass yet beyond the original build and
the site-wide comments-widget rollout.

## Open / deferred

Nothing currently open for this game.
