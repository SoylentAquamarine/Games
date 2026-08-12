# Spades (cards/spades) — per-game handoff

Classic Spades, partnered 2v2 against computer opponents: bid, spades
are always trump, make your contract.

## What's here

- `index.html` — everything. `window.__spades` exposes the pure sim for
  headless testing, built on the shared `/games/cards/cards.js` engine
  (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game.

## Most recent pass — heavier code comments

Part of a site-wide comment-density pass (once the comment queue and
the admin config-page rollout both ran dry — see root `HANDOFF.md`).
Explained the two real Spades rules encoded in `bestOfTrick()`
(spades always trump, win by highest spade if any were played) and
`legalPlays()` (must follow suit if able; spades can't be led until
broken unless they're all that's left), plus a short note on
`aiChoose()`'s cheap-win-or-duck strategy. Comment-only — no logic
touched; existing `spades-stale-async-test.js` still passes unchanged.
Live-verified: deployed, zero console errors.

## Earlier pass — stale-AI-turn bug fix

**Bug fix: stale AI turn could leak into a new hand mid-bid.** Same class of
bug as hearts' HANDOFF: `proceed()`/`resolveTrick()` are `async` and `await
delay(...)` between plays with no check that the hand they belong to was
still current. Clicking **New Game** while an AI's `delay(600)` was pending
left that chain alive; when it woke up it read the live (now freshly-dealt)
`hands`/`trick`/`current` and could `playCard()` into the *new* hand's trick
— while that hand was still sitting in the bidding UI (phase never left
`"bid"`), before the player had even placed a bid. Confirmed headlessly:
bid, lead a card (schedules West's AI delay), click New Game before it
fires, then fire the orphaned timer and see a card land in a trick slot
while the bid buttons were still showing. Fix: added a `gen` counter bumped
in `startHand()`; `proceed()` and `resolveTrick()` capture it on entry and
bail out after each `await` if it no longer matches (same pattern as the
hearts fix).

Earlier: no player-feedback pass yet — this HANDOFF.md was created as part
of a documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note, which had missed the individual `cards/` sub-games).
Everything else under "What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
