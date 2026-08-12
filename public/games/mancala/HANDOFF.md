# Mancala (mancala) — per-game handoff

Standard 2-player Mancala (Kalah rules) against a CPU: sow stones
counter-clockwise from your pits, land your last stone in your store to
go again, capture across the board on an empty-pit landing.

## What's here

- `index.html` — everything. `window.__mancala` exposes the pure sim
  (`fresh`, `move`, `legal`, `ended`, `sweep`, `myPits`, `store`, `C`,
  spread flat too) for headless testing.
- Board is a flat 14-slot array: indices 0-5 are the player's pits, 6 is
  the player's store, 7-12 are the CPU's pits, 13 is the CPU's store
  (`myPits`, `store` helpers translate between "whose side" and indices).
- `move()` sows stones one at a time counter-clockwise, explicitly
  skipping the opponent's store (`while(s>0){...if(i===opp)continue;...}`).
  Landing the last stone in your own store grants an extra turn
  (`extra`); landing it in an empty pit on your own side captures that
  stone plus everything in the pit directly opposite (`12-i`) into your
  store.
- Game ends when either side's 6 pits are all empty; the other player's
  remaining stones are swept into their store (`sweep`) before declaring
  a winner by store count.
- CPU (`cpuTurn`) evaluates each legal move by the resulting store-count
  swing plus a flat bonus for earning another turn — no deeper lookahead.
- An in-page `<details>` "How to play" panel spells out the full rules.

## Most recent pass — admin config

Part of the site-wide admin config-page rollout (see root `HANDOFF.md`).
Starting seeds per pit (was hardcoded via `Array(14).fill(4)`) pulled
into a `C={SEEDS_PER_PIT:4}` object with the standard
localStorage-override IIFE (`mancala_config`, allowlist:
`SEEDS_PER_PIT`). Deliberately did **not** expose the 6-pits-per-side
layout — that's the standard Mancala/Kalah board; seeds-per-pit is the
usual variant dial real rule sets vary (some use 3 or 6 instead of the
classic 4). Registered in `/admin/games/`'s `NUMERIC_CONFIGS`. New
`mancala-config-test.js` (7 checks) verifies the default matches the
original hardcoded 4 and that an override (tested at 6) is respected by
`fresh()`, with both stores still correctly starting at 0 regardless.
Existing `mancala-sim-test.js` (500 randomized games) and
`mancala-fuzz-test.js` (2000 fuzzed games) both still pass unaffected.
Live-verified: deployed, confirmed the default board renders with 4
seeds per pit, zero console errors.

## Earlier pass

No player-feedback pass yet at the time this HANDOFF.md was created —
it was added as part of a documentation sweep (see the root
`HANDOFF.md`'s "Per-game HANDOFF.md rollout" note). Everything under
"What's here" reflects the game as originally built.

## Open / deferred

Nothing currently open for this game.
