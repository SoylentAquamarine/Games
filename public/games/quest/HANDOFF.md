# Quest — per-game handoff

Zelda-style 3×3 dungeon crawler with an overworld, boss fights, and a
level editor (`/admin/games/?game=quest`, "Configuration" panel).

## What's here

- `index.html` — everything: overworld, dungeon rooms, combat, bosses,
  the farmhouse store, coins. `window.__quest` exposes the pure sim for
  headless testing (`makeBoss`, `bossTakeHit`, `BOSSES`, `doorOpen`,
  `genRoom`, plus DOM-layer hooks `newGame`, `enterDungeon`,
  `enterOverworld`, `tryTransition`, `getMode`, `getRoom`, `getPlayer`,
  `setPlayerPos` added for testing navigation) — see
  `if(typeof document==="undefined") return;` for where the DOM-only part
  starts.
- Dungeon layout is editable per-room from the admin page; edits are
  stored in `localStorage["quest_layout"]` and read on load, falling back
  to the built-in default dungeon (`defaultDungeon()` in the admin page's
  script, mirrored by the in-game layout).

## Most recent pass

Two more bug reports, both fixed:

- **"swung twice and the Shadow Bat locked up"** — the earlier Thunder
  Hawk knockback fix only tried one computed direction; if a specific
  boss room's walls happen to block that exact direction, the knockback
  silently fails and the stun-lock can recur. Hardened: if the primary
  x/y knockback is fully wall-blocked, it now falls back to trying all 4
  cardinal directions, so a hit always finds an opening regardless of
  room geometry.
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
