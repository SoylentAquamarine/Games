# MasterChicken (mastermind) — per-game handoff

Mastermind code-breaker: crack a secret 4-color code (from 6 colors, with
duplicates allowed) in 10 tries, using black/yellow peg feedback.

## What's here

- `index.html` — everything. `window.__mastermind` exposes just `C` (the
  admin-tunable difficulty knobs below) — not a full pure-sim export.
- Pegs are drawn as egg shapes (`border-radius: 50% 50% 50% 50% / 62% 62%
  38% 38%`) rather than circles, matching the site's chicken theme.
- Feedback scoring (`submit`) is the standard two-pass Mastermind
  algorithm: exact color+position matches counted first (marked and
  excluded), then remaining color-only matches counted from what's left —
  correctly handling duplicate colors in the secret or guess.
- On a win or on running out of tries, the secret code is revealed as an
  extra row appended to the board (`reveal()`).
- **Admin-configurable** at `/admin/games/?game=mastermind`: `LEN` (code
  length) and `ROWS` (guesses allowed). Uses the site's generic
  numeric-knob config pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["mastermind_config"]`, merged into `C` at boot via an
  explicit allowlist. `COLORS.length` (6) stays fixed — it's an array of
  hex strings, not a plain scalar.

## Most recent pass

Added the admin config pane described above (`LEN`, `ROWS`) — no
gameplay change to the defaults. `LEN`/`ROWS` are still plain
identifiers throughout the rest of the file, just sourced from `C` at
the top instead of hardcoded, so no other usage sites needed touching.

Earlier: no player-feedback pass yet — this HANDOFF.md was created as
part of a documentation sweep (see the root HANDOFF.md's "Per-game
HANDOFF.md rollout" note). Everything under "What's here" reflects the
game as originally built.

## Open / deferred

Nothing currently open for this game.
