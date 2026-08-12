# Sorry! (board/sorry) — per-game handoff

Classic Sorry!: draw cards to move 4 pawns around the board, bump
opponents back to Start, first to get all 4 pawns Home wins.

## What's here

- `index.html` — everything. `window.__sorry` exposes `reset` and the
  pure move/scoring helpers for headless testing.
- 4 players (you + 3 CPU), a standard 60-space main track with 4 entry
  points (`ENTRY`), 8 slide zones (`SLIDES`, 2 per player color) that
  launch a landing pawn forward to the slide's end, and a 5-space safe
  lane per player leading Home.
- Card deck (`buildDeck`): 1/2 (start a pawn out, or move 1/2), 3, 4
  (move backward), 5, 7, 8, 10 (forward 10 or back 1 — player's
  choice), 11 (move 11 or swap places with an opponent's pawn), 12,
  and 4 "Sorry!" cards (bump any opponent pawn on the main track back
  to their Start, and take their spot).
- `optsEl`/`opts` renders a button per legal move when a card offers a
  choice (which pawn, forward-vs-back on a 10, move-vs-swap on an 11)
  — the player picks, the CPU picks via a scored heuristic
  (`bestOppMain`/the scoring weights around `s+=45` for a Sorry! bump,
  `s+=15` for a swap, `s+=10` for getting a new pawn out).
- **Stale-timer protection**: every CPU-turn `setTimeout` (card draw,
  CPU move selection, the delay before a forced re-draw on a 2) snapshots
  the generation counter (`const g=gen;`) and checks `g===gen` before
  acting; `newGame()` bumps `gen`. Verified during a bug-hunt pass this
  session — correctly guarded at every call site, no gap found.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (the `board/*` folder was the last set of games
missing per-game HANDOFF.md files — see the root HANDOFF.md's
"Per-game HANDOFF.md rollout" note). Everything under "What's here"
reflects the game as originally built, including the already-correct
stale-timer guarding.

## Open / deferred

Nothing currently open for this game. No admin-config-worthy numeric
knobs were found on inspection — the board geometry, slide positions,
and card counts are all specific to reproducing the real Sorry! rules,
not simple difficulty scalars.
