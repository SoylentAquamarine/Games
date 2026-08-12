# Video Poker (cards/videopoker) — per-game handoff

Classic Jacks-or-Better video poker: bet, draw, hold cards you want to
keep, paytable payout on the final hand.

## What's here

- `index.html` — everything. `window.__videopoker` exposes the pure sim
  for headless testing, built on the shared `/games/cards/cards.js`
  engine (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game (no obvious numeric knob
  to expose — the paytable is the whole game).

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
`evaluate()` had only its existing "wheel A-2-3-4-5" note — added an
explanation of the strongest-first early-return check order (so a
hand qualifying for multiple categories always scores its best one)
and the "Jacks or better" single-pair rule (rank ≥11 only). Comment-
only — no logic touched; existing `videopoker-evaluate-test.js` still
passes unchanged. Live-verified: deployed, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note, which had missed
the individual `cards/` sub-games). Everything under "What's here"
reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
