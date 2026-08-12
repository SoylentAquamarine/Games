# Yahtzee (yahtzee) — per-game handoff

Classic Yahtzee: roll 5 dice up to 3 times per turn, hold what you
want to keep, fill in the scorecard across 13 categories.

## What's here

- `index.html` — everything: dice rolling/holding, the full scorecard
  (upper section + bonus, three/four-of-a-kind, full house, small/large
  straight, Yahtzee, chance), scoring rules.
- **No pure-sim export** (`window.__yahtzee` does not exist) — unlike
  most other games on the site, this one has no headless test coverage
  via a `window.__` API. A bug-hunt pass this session verified scoring
  correctness (straights, full house, three/four-of-a-kind summing all
  5 dice per US rules, the upper-section 63+ bonus, held-dice
  persistence across re-rolls) via a DOM-mock test with a controllable
  `Math.random` instead — see the scratchpad's `yahtzee-*.js` if a
  proper `window.__yahtzee` export gets added later.
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Added explanations for `fullHouse()`'s 5-of-a-kind edge case,
`straight()`'s de-dupe-then-longest-run approach (shared by both
small and large straight, just with a different length threshold),
and `grandTotal()`'s 63/+35 upper-section bonus rule. Comment-only —
no logic touched; existing `yahtzee-scoring-test.js` still passes
unchanged. Live-verified: deployed, zero console errors.

## Earlier pass

No player-feedback pass yet, and a bug-hunt pass this session found no
real bugs (see "What's here"). This HANDOFF.md was created as part of a
documentation sweep — the earlier "done" HANDOFF.md rollout had missed
this game.

## Open / deferred

Nothing currently open for this game.
