# Snakes & Ladders (chutes) — per-game handoff

Classic Snakes & Ladders race to square 100 against a CPU, on a 10x10
boustrophedon board with animated token slides.

## What's here

- `index.html` — everything. `window.__chutes` exposes the pure sim
  (`JUMPS`, `applyJump`, `move`) for headless testing.
- `JUMPS` is a single fixed map of start-square → destination-square (10
  ladders up, 10 snakes down) baked into the file — there's no board
  randomization or editor.
- The board is drawn as a 10x10 CSS grid with numbers computed to snake
  boustrophedon-style (`numToXY`), and an SVG overlay (`#ov`) draws a
  colored line for every ladder/snake plus the two player token dots.
- Rolls animate step-by-step across each intermediate square
  (`animateMove`), with an extra slide segment tacked on when the landing
  square triggers a jump (`hasSlide`), so a ladder/snake climb/fall is
  visibly distinct from a normal move.
- Rolling past 100 bounces back (`if(np>100) np=100-(np-100)`) rather than
  requiring an exact roll.
- No admin config pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
