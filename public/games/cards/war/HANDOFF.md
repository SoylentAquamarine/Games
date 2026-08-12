# War (cards/war) — per-game handoff

Classic War: highest card wins the pile, ties trigger a face-down/
face-up "war," last player with cards wins.

## What's here

- `index.html` — everything, built on the shared `/games/cards/cards.js`
  engine (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker) for the
  deck model and card rendering.
- **No pure-sim export** (`window.__war` does not exist) — unlike most
  other card games on the site, this one has no headless test coverage
  yet. Worth adding if this game gets a real bug-fix pass.
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Cleaned up an existing but run-on/confusing inline comment on
`playRound()`'s "both sides emptied their hands laying down war cards
simultaneously" edge case into a clear explanation, and added a note
on the standard War tie-break (up to 3 face-down, then flip again)
above it. Comment-only — no logic touched. Live-verified: deployed,
zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note, which had missed
the individual `cards/` sub-games). Everything under "What's here"
reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
