# Crazy Eights (cards/crazy8) — per-game handoff

Classic Crazy Eights: match rank or suit, 8s are wild and let you call
the next suit, first to empty their hand wins.

## What's here

- `index.html` — everything, built on the shared `/games/cards/cards.js`
  engine (`Cards.makeDeck`, `Cards.cardEl`, deck theme picker) for the
  deck model and card rendering.
- **No pure-sim export** (`window.__crazy8` does not exist) — unlike
  most other card games on the site, this one has no headless test
  coverage yet. Worth adding if this game gets a real bug-fix pass.
- No admin config pane wired up for this game.

## Most recent pass

**Bug fix: stale CPU turn could leak into a new game.** `cpuTurn()` is
scheduled with a bare `setTimeout(cpuTurn,750|700)` (from `afterYou()` /
`endYouTurn()`) that's never cancelled, and the function only guarded on
`over`. Clicking **New Game** while that timer was still pending left it
alive; `newGame()` resets `over=false` along with a brand-new
stock/discard/you/cpu, so when the stale timer fired, `cpuTurn()` didn't
bail — it popped a card off the *new* CPU hand and pushed it onto the new
discard pile (occasionally even ending the brand-new game immediately as a
CPU win via the `cpu.length===0` check), all before the player had done
anything. Confirmed headlessly: click a playable card to schedule the CPU's
turn, click New Game before it fires, then fire the orphaned timer and see
the freshly-dealt CPU hand shrink and the banner change with zero player
input. Fix: `cpuTurn()` now also checks `turn!=="cpu"` up front — since
`newGame()` always resets `turn` to `"you"`, an orphaned timer from an
abandoned game now sees the mismatch and no-ops instead of mutating state
(`public/games/cards/crazy8/index.html`, `cpuTurn()`).

Earlier: no player-feedback pass yet — this HANDOFF.md was created as part
of a documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note, which had missed the individual `cards/` sub-games).
Everything else under "What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
