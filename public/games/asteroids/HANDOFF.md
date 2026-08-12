# Chicken Roids (asteroids) — per-game handoff

Asteroids-style rock-shooter: drift, thrust, shoot rocks into smaller
pieces, dodge space weasels.

## What's here

- `index.html` — game state lives in closures, not exposed via a
  `window.__` pure-sim surface; tests for this game work by statically
  checking the source for the right guard patterns and hand-simulating
  the state machine in the test file rather than driving the real
  functions (see `asteroids-flyby-test.js` for the pattern).
- Calmer egg field, an interlude flyby, space weasels as a hazard.
- A space-suit-chicken flyby cameo fires once per `FLYBY_EVERY`-wave
  milestone, gated by a `flybyWave` sentinel (not just a `!flyby` flag)
  so it can't double-fire if the milestone wave repeats.

## Most recent pass

Fixed the flyby cameo re-appearing if you died while it was mid-pass —
the guard used to just check `!flyby` (cleared once the pass finished),
so dying and having the wave counter roll back onto the same milestone
wave could trigger a second pass. Now a `flybyWave` sentinel records
*which* wave it already fired for, so it's strictly once per
milestone regardless of deaths in between; only resets on a full
new-game reset.

## Admin config

`/admin/games/?game=asteroids` — 5 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `LIVES`,
`DEATH_FRAMES`, `RESPAWN_INV`, `FLYBY_EVERY`, `WEASEL_FROM`. Pulled
out of plain `const` declarations into a mutable `C` object; an IIFE
reads `localStorage.asteroids_config` on load and overrides any
matching numeric key via an explicit allowlist. This is the first
minimal `window.__asteroids={C}` export this game has ever had — added
purely to make `C` (and therefore the config override) verifiable;
the rest of the game's state is still closure-only, untested by
anything but the static source-regex checks in
`asteroids-flyby-test.js` (which had two literal patterns —
`wave%FLYBY_EVERY===0` and `lives=3` — updated to their new
`C.FLYBY_EVERY`/`C.LIVES` source shape).

## Open / deferred

Nothing currently open for this game.
