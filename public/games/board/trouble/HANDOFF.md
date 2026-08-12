# Trouble (board/trouble) — per-game handoff

Classic Trouble: pop the die, roll a 6 to bring a pawn out, race all 4
pawns around the track and home, landing on an opponent sends their
pawn back to Start.

## What's here

- `index.html` — everything. `window.__trouble` exposes `legalMoves`,
  `applyMove`, `won`, `entry` for headless testing (each accepts an
  optional `st` param to inject a pawn-state array for a given test
  case, since the real `pawns` array lives in the closure).
- 4 players (you + 3 CPU), a shared 28-space circular track (`TRACK`)
  with each player's own entry point offset by 7 spaces (`entry(p) =
  p*7`, evenly spacing 4 players around a 28-space loop) plus a private
  4-space home run per player (positions 28-31).
- A pawn only leaves Start on a roll of 6 (`legalMoves`); landing
  exactly on an opponent's pawn (`applyMove`'s bump check, comparing
  each pawn's *absolute* track position via `(entry(q)+pos)%TRACK`
  since each player's positions are stored relative to their own entry
  point) sends that pawn back to their Start. Rolling a 6 also grants
  another roll (see the hint text / `phase` handling).
- **Stale-timer protection**: the CPU-turn `setTimeout` (roll delay,
  auto-move-then-advance) snapshots the generation counter (`const
  g=gen;`) and checks `g===gen` before acting; `newGame()` bumps `gen`.
  Verified during a bug-hunt pass this session — correctly guarded at
  every call site, no gap found.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (the `board/*` folder was the last set of games
missing per-game HANDOFF.md files — see the root HANDOFF.md's
"Per-game HANDOFF.md rollout" note). Everything under "What's here"
reflects the game as originally built, including the already-correct
stale-timer guarding.

## Open / deferred

Nothing currently open for this game. No admin-config-worthy numeric
knobs were found on inspection — the 28-space track and per-player
entry offsets are specific to reproducing the real Trouble board
layout, not simple difficulty scalars.
