# MasterChicken (mastermind) — per-game handoff

Mastermind code-breaker: crack a secret 4-color code (from 6 colors, with
duplicates allowed) in 10 tries, using black/yellow peg feedback.

## What's here

- `index.html` — everything. No `window.__` export — this game doesn't
  expose a pure sim for headless testing (grepped the file to confirm).
- Pegs are drawn as egg shapes (`border-radius: 50% 50% 50% 50% / 62% 62%
  38% 38%`) rather than circles, matching the site's chicken theme.
- Feedback scoring (`submit`) is the standard two-pass Mastermind
  algorithm: exact color+position matches counted first (marked and
  excluded), then remaining color-only matches counted from what's left —
  correctly handling duplicate colors in the secret or guess.
- On a win or on running out of tries, the secret code is revealed as an
  extra row appended to the board (`reveal()`).
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
