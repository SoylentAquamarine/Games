# Word Guess (wordle) — per-game handoff

Wordle-style word guesser: 6 guesses to find the hidden word, tile
colors show right-letter-right-spot / right-letter-wrong-spot / absent.

## What's here

- `index.html` — everything. `window.__wordle` exposes the pure sim for
  headless testing.
- Original build: added alongside Flappy, Doodle Jump, and Stack.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
This file had zero inline comments despite `color()` being the classic
two-pass Wordle duplicate-letter algorithm — a naive single pass
over-marks "present" when a guessed letter repeats more times than the
answer actually contains it. Added a comment explaining the two-pass
fix (exact matches consume from a letter-count pool first, present
matches only claim what's left) and a short note on `setKey()`'s
never-downgrade keyboard-color rule. Comment-only — no logic touched.
Live-verified: deployed, zero console errors.

## Earlier pass

Addressed in a round of player comments shared with digdug, pinball, and
chutes (`feat(games): address more player comments (digdug, wordle,
pinball, chutes)`) — no wordle-specific detail recorded separately from
that batch.

## Open / deferred

Nothing currently open for this game.
