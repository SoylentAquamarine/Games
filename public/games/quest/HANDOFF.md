# Quest — per-game handoff

Zelda-style 3×3 dungeon crawler with an overworld, boss fights, and a
level editor (`/admin/games/?game=quest`, "Configuration" panel).

## What's here

- `index.html` — everything: overworld, dungeon rooms, combat, bosses,
  the farmhouse store, coins. `window.__quest` exposes the pure sim for
  headless testing (`makeBoss`, `bossTakeHit`, `BOSSES`, `doorOpen`,
  `genRoom`, plus DOM-layer hooks `newGame`, `enterDungeon`,
  `enterOverworld`, `tryTransition`, `update`, `getMode`, `getRoom`,
  `getPlayer`, `getBoss`, `setPlayerPos`, `setRoom` added for testing
  navigation/combat) — see `if(typeof document==="undefined") return;` for
  where the DOM-only part starts.
- **Gotcha for future boss-fight edits**: `bcx`/`bcy` (the boss's centre
  point) are computed once at the top of the `if(!b.dead){...}` block and
  reused by both the movement branch AND the player-collision check below
  it. Don't move that computation back inside the `if(b.hurt>0){}else{}`
  split — see the crash this caused, below.
- Dungeon layout is editable per-room from the admin page; edits are
  stored in `localStorage["quest_layout"]` and read on load, falling back
  to the built-in default dungeon (`defaultDungeon()` in the admin page's
  script, mirrored by the in-game layout).

## Most recent pass

**The actual cause of both "the game froze/locked up" reports, found**:
`bcx`/`bcy` used to be `const`-declared *inside* the `else` branch of
`if(b.hurt>0){b.hurt--;}else{...movement, declares bcx/bcy...}` — the
branch that only runs while the boss is NOT paused. They were then
referenced again, unconditionally, in the player-touches-boss collision
check further down the same block. Touch a PAUSED boss (`b.hurt>0` — true
right after you land a sword hit, exactly when melee contact is likely)
and that reference hit a plain `ReferenceError`, with no try/catch
anywhere above it in the call stack — silently killing the whole
`requestAnimationFrame` loop. That's what "the game just hung" actually
was: a crash with no visible error, not a stall. Confirmed by a second,
more precise report — "ran into Prism Peacock without hitting it with the
sword and the game just hung right there" — which pinpoints the exact
trigger (touch, no swing) that only makes sense against this bug. Fixed
by hoisting `bcx`/`bcy` to compute unconditionally before the hurt-gated
branch.

The earlier boss-freeze work (below) was a real, worthwhile hardening
pass, just not the actual crash:

- The Thunder Hawk knockback fix only tried one computed direction; if a
  specific boss room's walls happen to block that exact direction, the
  knockback silently fails and the stun-lock pattern it was meant to
  prevent can recur. Hardened: if the primary x/y knockback is fully
  wall-blocked, it now falls back to trying all 4 cardinal directions.
- **"when I enter a dungeon then if I go down I pop back out"** — the
  start room (1,1) sits at the CENTER of the 3x3 grid with a real door on
  all 4 sides (`doorOpen()`/`genRoom()` both treat it as fully connected),
  but `tryTransition()` had an unconditional special-case that hijacked
  ANY south-edge touch there into an overworld exit before normal
  room-transition logic could run — so "down" could never reach room
  (1,2) like every other direction could. South is now a normal door;
  leaving the dungeon has its own explicit "🚪 Leave" HUD button instead.

Earlier pass: fixed a "fighting Thunder Hawk froze up on me" bug report.
Root cause: an earlier-still pass added a 0.5s hit-pause on bosses
(`b.hurt=30`), but a hit that lands from a standing position could
re-trigger the instant the pause ended, from the same spot — chaining
into a near-permanent stun since the boss never got a frame to move. Fix:
a landed hit also knocks the boss back a fixed distance (now hardened per
above).

## Open / deferred

- **"Fight the final boss in the overworld"** (player feedback) — the rest
  of that comment (no enemies in the boss room, boss movement, coins
  counter, farmhouse store) is done. This one sub-ask is deliberately left
  open: it's architecturally ambiguous (does the overworld need a
  dedicated boss-arena zone? does the dungeon room get skipped entirely?)
  and needs the player's design input before implementing, same as the
  precedent set for DK/Kaboom's bigger asks.
