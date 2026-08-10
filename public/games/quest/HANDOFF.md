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
  split — see the crash this caused, below. The Fox King fight (see
  "Most recent pass") duplicates this same pattern deliberately rather
  than sharing a helper with the per-dungeon boss block — same gotcha
  applies there too if it's ever edited.
- Dungeon layout is editable per-room from the admin page; edits are
  stored in `localStorage["quest_layout"]` and read on load, falling back
  to the built-in default dungeon (`defaultDungeon()` in the admin page's
  script, mirrored by the in-game layout).
- Two separate boss fights now exist: `boss` (per-dungeon, fought in the
  locked TRI room, drops that dungeon's gem egg) and `finalBoss` (the Fox
  King, fought loose in the overworld, only exists after the 12th egg).
  They're independent state — `getBoss()`/`getFinalBoss()` for tests.
- **The player's hero-chicken sprite is drawn from the shared
  `/mascots.js` library** (`Mascots.heroChicken(ctx,x,y,size,dir)`) —
  this game's existing player avatar was the one extracted to become the
  site-wide "Hero chicken" from the original mascot-library comment.
  `dir` follows this game's own convention (0=up,1=down,2=left,3=right).
  Any test that boots this page through a mocked DOM (i.e. anything that
  reaches `render()`) needs a `Mascots: { heroChicken(){} }` stub in its
  sandbox now, same as `Arcade`/`Cards` for other games.
- **`finalBoss` is in-memory only — it does NOT survive a reload.**
  `eggs` (the carton) DOES persist, via `localStorage["quest_eggs"]`. That
  mismatch is exactly what caused the vanish/unwinnable bug below,
  so any future final-boss-adjacent state needs the same treatment: either
  persist it, or self-heal it every frame the way `update()` now does
  (`foxKingDefeated()`/`markFoxKingDefeated()`, `localStorage["quest_foxking"]`).
- A HUD "New Game" button (`#newGameBtn`) is always available during play,
  not just on the death/win overlay — calls `resetProgress()`, which wipes
  both `quest_eggs` and `quest_foxking` before calling `newGame()`.

## Most recent pass

**Three player comments, addressed together:**

1. **"the dungeons need to be randomized a bit, keep the boss in the same
   place but the location of the key needs to be random."** The boss
   room (`TRI`) is untouched. The key's exact tile within `KEYROOM` is
   now picked from that room's own already-built floor tiles (walls/
   rocks excluded) instead of the old hardcoded `(7,3)` — different each
   new dungeon/game. Custom (hand-designed) rooms use the same seeded
   `rand` stream already used for their enemies, so a saved layout's key
   spot stays stable across visits rather than reshuffling every time.
2. **"the weasels are too hard to hit, they never line up with me."**
   The sword's reach/width was already widened once before (see
   further down); this time the fix is a small forgiveness margin
   (`EHIT_PAD`, 5px each side) added ONLY to the sword-vs-weasel
   hit-test, not to the player's own hurtbox — so landing a
   close-but-not-pixel-perfect swing now counts, without making weasels
   any easier to walk into.
3. **"dungeon weasels need to respawn."** Previously a room's weasels
   stayed dead for the rest of that dungeon visit once killed — only
   fully re-entering the dungeon (`enterDungeon`) rerolled them. Walking
   through a door into a room whose weasels are ALL dead now calls the
   new `respawnRoomEnemies(rx,ry)`, which rerolls a fresh set for that
   room (never the start room, never the boss arena, and never a room
   that still has survivors up — clearing it first is still required).
   This is a deliberate departure from "cleared stays cleared for the
   visit" — see the old "Open / deferred" note this replaces for the
   scoping options that were considered; "respawn on walking back into a
   cleared room" was picked as the most literal reading of the ask.

Earlier: **player reports: "the speed got way too fast" / "there is a speed
glitch it will suddenly be like 4x the speed."** Root cause: the "↺ New
Game" HUD button is always visible, even mid-game, and `newGame()`
started a fresh `requestAnimationFrame` chain (`running=true;loop()`)
without cancelling whatever chain was already in flight — unlike
`gameOver()`/`win()`, which both `cancelAnimationFrame(raf)` first.
Clicking New Game while already playing stacked a second, fully
independent `loop()` chain on top of the first, each calling `update()`
once per real frame — doubling movement speed. A second accidental click
tripled it, matching the reported sudden 4x speed exactly. Fixed by
cancelling any in-flight frame before starting a new one.

Also: **"the dungeon weasels seem to drop mostly coins, we need slightly
more % chance of hearts."** Heart-drop chance among weasel kills raised
30% → 45%.

Earlier: **player feedback: "I want specific sprites for each of the bosses and
the main boss is a fox it shuld be a fox with a crown not a chicken
sprite."** Partially addressed — see "Open / deferred" for what's still
outstanding. The Fox King (the boss named explicitly) is the one that
mattered most here, since he's the single final boss every player
fights, unlike the 12 per-dungeon bosses. He now renders through his own
`drawFoxKing()` instead of the shared `drawBoss()`: pointed ears with
dark inner triangles, a white muzzle patch and nose, a bushy
white-tipped tail, and a gold crown with a red jewel — no rooster
comb/beak anywhere. The shared name+hp-bar label was factored out into
`drawBossLabel()` so both draw functions call the same one rather than
duplicating it.

Earlier: **"I don't want the levels to be random, they will be
the same always, I will design each of them in the designer screen."**
The saved room MAP already stuck via `localStorage["quest_layout"]`, but
the ENEMY list inside that same room was always freshly re-rolled with
`Math.random()` on every single visit regardless — so a fully
hand-designed dungeon still felt random. A custom room's enemies
(position, count, direction, timer) now come from a seeded,
deterministic stream keyed on `(curDungeon, rx, ry)` — the SAME custom
room always produces the SAME enemies on every visit. Procedurally-
generated (non-custom) rooms are completely untouched, still freshly
randomized each time. Also exported `RX`/`RY` (the dungeon room-grid
size) from `window.__quest` for testing.

Earlier: **"not every house should have the same thing also the
houses should have wooden plank flooring and furniture and stuff and
only a few should have a coin or a heart and they should not respawn."**
`genHouseRoom(isStore)` used to generate an identical, decor-free
interior every time — 2 fixed items (a coin + a heart), always present,
and since a fresh `R.items` array was built on every `enterHouse()` call,
anything taken effectively DID respawn on the next visit. Now:

- Each regular farmhouse's loot is rolled ONCE per game
  (`genHouseLoot()`), at overworld-generation time, and stored on that
  screen's `house.loot`. Most houses roll empty; a minority get a coin, a
  heart, or (rarely) both. `enterHouse()` reuses that SAME array on every
  re-entry instead of rebuilding it, so `taken:true` sticks.
- `genHouseRoom(isStore, loot, furniture)`'s new params are both
  optional, defaulting to the exact original always-coin-and-heart
  loadout — every pre-existing caller (including the test suite) is
  unaffected.
- Floors are wood plank courses (`PLANK_ROWS`, staggered board-end
  seams) instead of a flat two-colour checkerboard, and every house gets
  one small persisted furniture piece (table+chair, bed, bookshelf, or
  rug — `FURNITURE_KINDS`, drawn by `drawHouseFurniture`) in a corner
  clear of the door and any loot.

Earlier: **"when i kill the fox king i will be banging on the
space bar so the space bar can't trigger the next thing or else it will
fly past."** The keydown handler already called `preventDefault()` for
Space (stops the page from scrolling), but the keyup handler didn't —
and browsers activate a focused `<button>` on Space's **keyup**, not
keydown. Whatever button last had focus (e.g. "Play again", freshly
revealed the instant the fight ends) could get a phantom click from the
very same spacebar mash that landed the winning hit, skipping straight
past the win screen into a new game. Fixed by adding
`e.preventDefault()` for Space to the keyup handler too.

Earlier: extracted the player's hero-chicken sprite into `/mascots.js` as
`Mascots.heroChicken` — no gameplay/visual change, purely
de-duplicating what was this site's most developed protagonist design
so other top-down/4-directional games can reuse it. Completes the
original mascot-library comment's "3 standard characters" ask (mascot/
spacesuit chicken, rooster, hero chicken — all 3 now shared library
functions); only the separate Dr Chicken surgical-mask redesign remains
open on that comment (see drmario's HANDOFF.md).

Earlier — **player feedback, landed right after the Fox King shipped: "triggered
the main boss then went into a dungeon, now the main boss has vanished
and the game is unwinnable."** Root cause: `finalBoss` was spawned exactly
once, inside the one-time 12th-egg pickup handler, with no persistence —
so any state that dropped it (a reload being the most likely real-world
trigger, since `eggs` persists but `finalBoss` never did) left the player
permanently stuck: once every `eggs[n-1]` is true, no dungeon boss or egg
item ever spawns again, so there was no remaining path to re-trigger the
fight. Fixed with a self-healing check at the top of `update()`: whenever
the carton is full, the boss isn't currently spawned, and he hasn't
actually been beaten yet, bring him back. The "hasn't actually been
beaten yet" part needed its own persisted flag (`quest_foxking` in
`localStorage`) — otherwise a genuine win would just respawn him forever
on the next frame. Same round of feedback also asked for a reset button
("we need a reset/new game button"), added to the HUD (see "What's here").
A third comment in the same batch — "there is no stairway to climb out of
the dungeon" — is left open; the existing "🚪 Leave" HUD button already
does this (verified working, unrelated to the above bug), so this reads
as a discoverability/design ask rather than something broken. Needs a
closer look or player clarification before archiving.

**Player feedback: "when we trigger final boss we have to fight him in
the overland."** Filling the carton used to immediately end the game with
a "Final boss coming soon!" placeholder. Now the 12th egg spawns a real
Fox King (`makeFinalBoss()`, 20 hp — noticeably tougher than any
per-dungeon boss, which top out at 11) loose in the open farmyard at the
same fixed coordinate every new game already spawns the player at (known
walkable in every generated overworld, so no risk of spawning him inside
scenery). He uses the exact same fight rules as a per-dungeon boss
(pause-on-hit, 4-way knockback fallback) — copied rather than shared via
a helper, to avoid touching the already-hardened, already-tested
dungeon-boss code path. Defeating him calls the real `win()`. The other 4
parts of that same comment (no enemies in the boss room, bosses that
actually move, a coins counter instead of rupees, a farmhouse store) were
already fixed in the code before this pass — this closed out the last
piece, and the comment has been archived.

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

- **"There is no stairway to climb out of the dungeon"** — left open
  (not archived). The 🚪 Leave HUD button already does exactly this and
  is confirmed working; this may be a discoverability complaint (wants a
  more obvious/thematic in-world exit rather than a small HUD button) or
  may have been confusion from the vanish bug above rather than a
  separate real ask. Get more player detail before changing anything.
- **"I want specific sprites for each of the bosses, and the main boss
  is a fox — it should be a fox with a crown, not a chicken sprite"** —
  **partially done.** The Fox King (the boss explicitly named in the
  comment) now has his own `drawFoxKing()` sprite — pointed ears, a white
  muzzle, a bushy tail, a gold crown with a jewel, no rooster comb/beak —
  see "Most recent pass". **Still open**: the 12 per-dungeon bosses
  (`BOSSES[]`) still all share `drawBoss()`'s generic rooster-ish
  silhouette, just recolored per `BOSSES[i].color`. Giving each of THEM
  bespoke art is a much larger design/art pass (12 distinct sprites, not
  a quick tint change) — left for a future comment; don't archive this
  one until that's done too.
- The original mascot-library comment is fully resolved — see the root
  `HANDOFF.md`'s mascots.js entry (spacesuit chicken, rooster, hero
  chicken, and Dr Chicken's redesign are all done).
