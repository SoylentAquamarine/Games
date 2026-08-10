# Chicken-Man (pacman) — per-game handoff

Pac-Man-style maze chase: eat dots, avoid ghosts, power pellets turn the
tables temporarily.

## What's here

- `index.html` — everything. `window.__pacman` exposes `MAP`,
  `DEFAULT_MAP`, `isValidMap`, `ROWS`/`COLS`, `getPacStart`/
  `getGhostStarts`/`getDots` for headless testing — a minimal export
  added alongside the board editor below, not a full pure-sim
  extraction (the step/render loop itself is still untested).
- Arcade ghost AI (each ghost has its own classic-style targeting
  behavior, not just "chase the player" for all four).
- Smooth (non-grid-snapped) player movement and a death animation.
- `Arcade.sfx` wired up for sound (shared pass with lander, galaga).
- **Admin-configurable** at `/admin/games/?game=pacman`: a real maze
  board editor, part of the site's board/level-editor rollout (see
  kaboom's/quest's HANDOFF.md for the general pattern). `MAP` is
  overridable via `localStorage["pacman_map"]` (`isValidMap` requires
  every row to be the same width — a ragged row would silently punch a
  hole in the boundary wall instead of erroring — safe fallback to
  `DEFAULT_MAP` otherwise).

## Most recent pass

**Board/level editor rollout: pacman was the next candidate** (root
`HANDOFF.md` — a single fixed `MAP`, closer to adventure's "one
editable layout" shape than quest/sokoban's "N levels" shape). Added a
single-grid paint-tool canvas in the admin panel (6 brushes: wall/dot/
power pellet/empty floor/player start/ghost start), sized to the
maze's own 21×19 default — no level picker needed, since there's only
one maze to edit. `MAP` was renamed `DEFAULT_MAP` with the usual
override/fallback wiring; a pre-existing scratchpad regression test
(`pacman-swap-collision-test.js`) that detected this game's script by
looking for the literal `const MAP=` needed updating to look for
`const DEFAULT_MAP=` instead — a legitimate, deliberate rename, not a
regression.

Earlier: **bug fix (found in a code-review pass, not player-reported): a ghost
could pass straight through the player.** `checkCollisions()` only caught
pac and a ghost landing on the SAME cell after both moved. In a 1-wide
corridor, a head-on approach lets them swap cells within one tick — pac
moves into the ghost's old cell while the ghost moves into pac's old cell
— so they cross without ever sharing a tile, and the hit never
registered (a chasing ghost glided through unharmed; frightened, it could
dodge being eaten the same way). Fixed by catching the swap right when
each ghost's before/after cell is known, comparing against pac's own
before/after cell for that tick. The "eaten vs. died" branch is now a
shared `catchPac(g)` helper used by both the swap check and the normal
same-cell check.

Earlier: **player feedback: "the blue does not last long enough, we need
sound indications that the chickens are blue and that they are about to
turn back."** `FRIGHT_TICKS` (frightened-mode duration) raised from 28 to 45
ticks (4.2s → 6.75s at the 150ms step rate); `FRIGHT_WARN_TICKS` (the
pre-flip flash window) scaled up proportionally from the last 8 ticks to
the last 12. Eating a power pellet now plays a new `Arcade.sfx.power()`
cue instead of the generic pickup blip, and a new `Arcade.sfx.warn()`
beep ticks in sync with the white/blue flash during the warning window —
an audible countdown to match the existing visual one. Both new sfx were
added to the shared `arcade.js` (any game can use them).

Earlier: gentler difficulty curve with rounder colors and gliding
(interpolated, not grid-snapped) ghost movement — shared pass with
Missile Command's own curve tuning. Earlier still: classic-accurate ghost
behavior fix (was likely a simpler/uniform AI before). Original
gameplay-defining pass: smooth movement, death animation, and arcade
ghost AI all together.

## Open / deferred

Nothing currently open for this game.
