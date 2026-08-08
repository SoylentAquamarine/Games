# Mancala (mancala) — per-game handoff

Standard 2-player Mancala (Kalah rules) against a CPU: sow stones
counter-clockwise from your pits, land your last stone in your store to
go again, capture across the board on an empty-pit landing.

## What's here

- `index.html` — everything. `window.__mancala` exposes the pure sim
  (`fresh`, `move`, `legal`, `ended`, `sweep`, `myPits`, `store`) for
  headless testing.
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
  No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
