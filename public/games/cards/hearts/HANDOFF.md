# Hearts (cards/hearts) — per-game handoff

Classic Hearts against 3 computer opponents: avoid taking hearts and
the Queen of Spades, shoot the moon if you dare.

## What's here

- `index.html` — everything. `window.__hearts` exposes the pure sim for
  headless testing, built on the shared `/games/cards/cards.js` engine
  (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker).
- No admin config pane wired up for this game.

## Most recent pass

**Bug fix: stale AI turn could leak into a new hand mid-pass.** `proceed()`
and `resolveTrick()` are `async` and `await delay(...)` between plays (CPU
"thinking" pauses, "takes the trick" pause). Neither checked whether the
hand they belonged to was still current. Clicking **New Game** while a CPU's
`delay(600)` was pending left that chain alive; when it woke up it read the
live (now freshly-dealt) `hands`/`trick`/`current` and could call
`playCard()` into the *new* hand's trick — while that hand was still showing
the "Pass 3 cards" UI (phase never actually left `"pass"`). Confirmed
headlessly by deterministically replaying the same shuffle for two
consecutive hands (so the seat holding 2♣ is predictable), interrupting a
scheduled AI delay with a "New Game" click, then firing the stale timer and
observing a card land in a trick slot while the pass button was still
visible. Fix: added a `gen` counter bumped in `startHand()`; `proceed()` and
`resolveTrick()` capture it on entry and bail out after each `await` if it
no longer matches, so a chain orphaned by a reset simply stops instead of
mutating the new hand.

Earlier: no player-feedback pass yet — this HANDOFF.md was created as part
of a documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note, which had missed the individual `cards/` sub-games).
Everything else under "What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
