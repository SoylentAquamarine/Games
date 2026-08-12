# Chicken Adventure (adventure) — per-game handoff

Atari Adventure-style overworld crawl: rooms on a grid, keys, a sword,
dragons that chase, castles, a 100%-completion secret ending.

## What's here

- `index.html` — everything. `window.__adventure` exposes the pure sim
  (`newGame`, `tick`, `drop`, `respawn`, `dragonStep`, `stepPendingArrivals`,
  `collide`, `ROOMS`, `borderWalls`, `roomWalls`, `LABEL`, `doorwaySpot`,
  `distToExit`, `chaseDelayFor`, `placeDragonsAway`) for headless testing.
- Rooms sit on a real grid with an overworld map shown beside the game
  canvas (side-by-side row, not stacked below it).
- Dragons have a real chase behavior: leaving a room with a live dragon in
  it gives it a flat `CHASE_CHANCE` (90%) chance to follow — `CHASE_DECAY`
  exists but is currently a no-op (1); see "Most recent pass" for why. A
  dragon that follows arrives through the same doorway the hero just used
  (`doorwaySpot`), after a delay proportional to how far it actually was
  from that exit, divided by its own speed (`chaseDelayFor`/`distToExit`)
  — not a flat constant.
- **A dragon simply resident in a room stays exactly where it physically
  is between visits** — `placeDragonsAway` (far-corner placement) is only
  called by `respawn()` now, giving dragons a fresh, safe layout after a
  death, not on every ordinary room transition.
- **A chasing dragon doesn't become visible in the new room until its
  travel delay actually elapses** — see "Most recent pass" below. While
  pending, it's tracked via `d.pendingRoom`/`d.pendingSpot` and
  `stepPendingArrivals()` resolves the transition once `chaseDelay`
  reaches 0.
- The Restart button is disabled (greyed out) whenever it would be a
  no-op — synced to `state.dead` every frame — instead of silently doing
  nothing when clicked mid-play.
- Dragons the hero has ever shared a room with (`d.triggered`) show their
  live current room on the overworld map from then on, including while
  chasing — untriggered (never-encountered) dragons stay hidden.
- A secret ending exists for 100% map completion.
- Level layout is editable from the admin page's Level Editor
  (`/admin/games/?game=adventure`) — same convention as Quest/
  Chickenmania; edits are stored in `localStorage["adventure_rooms"]` and
  read on load with a safe fallback to the built-in default map. Two
  editable pieces: the room POSITION grid (drag a room to a new cell,
  doorways derive automatically from grid adjacency) and, per selected
  room, its INTERIOR WALLS (`inner`, a drag-to-draw rectangle tool
  matching mini golf's wall brush) — the game's `ROOMS[id].inner` is what
  actually renders as obstacles inside a room.

## Most recent pass — dragon appearance delay + restart button feedback

Two player comments processed together:

1. **"when a dragon follows me to the different room, it can't appear
   immediately, it has to take the time it would have taken to get to
   the door anyway."** This is exactly what `chaseDelayFor` already
   computed — but the delay only ever gated the dragon's ability to
   *move or attack* (`dragonStep`'s `chaseDelay>0` early-return). The
   dragon's `d.room` was reassigned to the new room at the moment it
   decided to follow, and `draw()` renders any dragon whose room
   matches the hero's with no regard for `chaseDelay` — so its sprite
   popped into the new room, sitting right at the doorway, the instant
   you crossed. Only its behavior was delayed, not its visibility.
   Fixed by not reassigning `d.room` at decision time at all: a
   following dragon is now tracked as pending
   (`d.pendingRoom`/`d.pendingSpot`) while it stays wherever it
   physically was (off-screen, since the hero's already left that
   room) — a new `stepPendingArrivals()`, called every tick, counts
   `chaseDelay` down and only moves the dragon into the new room (at
   the doorway spot) once it actually reaches 0. `respawn()` now also
   clears `pendingRoom`/`pendingSpot` so a death mid-chase can't leave
   a ghost arrival pending.
2. **"restart did not resume the game."** The Restart button was
   always clickable but silently did nothing unless `state.dead` —
   correct by design (see the restart-button feedback further down),
   but a click during normal play looked exactly like a broken button.
   It's now `disabled` (greyed out via a new `.btn:disabled` style)
   whenever it would be a no-op, synced every frame in the render
   loop — the button's own state now communicates "not available right
   now" instead of failing silently.

Both fixes verified against the full existing test suite (11 files) —
3 files needed updates for the deliberately changed behavior/markup:
`adventure-dragon-chase-test.js` and `adventure-chase-decay-map-test.js`
(both previously asserted a chasing dragon's room/position updated
the instant it crossed a doorway — now correctly assert it stays
pending until `stepPendingArrivals` resolves the delay) and
`adventure-restart-button-test.js` (a literal-source gap-length regex
between `id="restart"` and `id="new"` needed widening for the longer
`disabled`/title-text markup). All 11 files pass. Live-verified:
deployed, confirmed the button starts disabled on a fresh load, zero
console errors.

## Earlier pass — black castle maze + bridge barrier

**Player feedback: "We need the black castle to have a lot of rooms
inside it and to be a maze, and we need to have to use the bridge to
cross a barrier to get to the chalice. The bridge needs to be more like
a bridge."** (This comment's other two asks — dragons appearing where
they left off, and a 90% chase chance following between rooms — were
already resolved in an earlier pass; this closes out the rest of it.)

- **The black castle interior is now 5 rooms, not 1**: `blackIn` (the
  entry hall, unchanged doorway from the gate) → `blackIn2` (a forking
  hall with 3 exits: back out, deeper in, or `blackIn2b`, a genuine dead
  end with no reward) → `blackIn3` ("The Chasm", see below) →
  `blackIn4` ("The Vault", where the chalice now lives — moved out of
  the old single `blackIn` room). All off-grid like the original
  `blackIn`/`goldIn` (hand-wired `exits`, not grid-derived), and
  `spawnRooms()`/`CASTLE_INTERIORS` now excludes all 5 from random
  item/dragon placement, not just the original 2.
- **The barrier**: `blackIn3` has an `inner` wall spanning the room's
  *entire* width (`{x:0,y:95,w:200,h:10}`, not just the door-gap span),
  so there is no way to sidestep around it — since `collide()` already
  treats "carrying the bridge" as "ignore all walls" (the pre-existing,
  documented bridge mechanic), placing a truly impassable wall in the
  only path to the vault makes the bridge a real requirement to reach
  the chalice, not just a nice-to-have shortcut. No new collision logic
  needed — this was a level-design fix, not an engine change.
- **The bridge looks like a bridge now**: `drawObject()`'s `"bridge"`
  case used to be 3 flat stacked rectangles. Now a plank deck with
  individual plank seams (a loop, not 2 fixed divider stripes), stroked
  rope rails along the span, and a post at each end.
- Applied to **both** copies of the room map: the single-player sim
  (`public/games/adventure/index.html`) and the real-time co-op world
  (`src/adventure-coop.js`, which the file's own header comment says is
  meant to mirror single-player) — otherwise the two modes would tell a
  different story about the same castle.

Tested via `adventure-black-castle-maze-test.js` (17 checks: all 5
rooms exist with reciprocal doors, the dead end and fork are real, the
chalice moved, castle rooms stay excluded from spawns across 200
randomized games, the barrier blocks without the bridge and passes
with it, the direct route is provably unreachable without ever
carrying the bridge, and the new bridge art draws real plank/rail/post
shapes) plus `adventure-coop-black-castle-maze-test.js` (8 checks,
same coverage against the co-op world, including two players in the
same room with only one holding the bridge). Full existing adventure
test suite (10 other files) still passes. Verified live: deployed and
walked the exported test API through the entire hall→fork→chasm→vault
route, blocked without the bridge and successful with it, zero console
errors.

## Earlier pass

**Player feedback: "insteaad of triggering the secret tecxt across the
screen with the gold castle on it, the secret is the guy enters the
gold castle and then the secret text is vertical like the warren
robinette text is in the original game."** Two changes in `castle()`
and `draw()`:

- Walking the chalice up to the gold gate used to win the game right
  at the gate, without the hero ever visibly stepping inside. Now every
  gate walk-in (winning or not) goes through the same "enter the
  interior room" transition first — the win/secret check runs the
  instant that transition happens, from inside the castle, not instead
  of it. Idempotent for free: once `s.room` is the interior, that
  room's `ROOMS` entry has no `.castle`, so `castle()` short-circuits
  on the next frame.
- The credit text (`"ADAPTED BY STEPHEN PLEASANTS"`) now renders one
  letter per line, spaces stripped, matching how the original 1979
  Atari Adventure's hidden "CREATED BY WARREN ROBINETT" room actually
  displayed it — replacing the old two-line horizontal banner.

Earlier: **player feedback: "there needs to be a restart button beside the new
game, so you can restart the same level if you die without resetting
the dead dragons to alive and everything in the game will continue."**
`respawn()` already preserved exactly that — dead dragons stay dead,
collected/dropped items stay in the world, only the hero's position and
`state.dead` reset. It just previously only ever fired automatically,
~1.2s after death (`deathT>1200` in the render loop). Added a `#restart`
button beside `#new` that calls the same `respawn()` immediately,
gated on `state.dead` so it's a no-op mid-play — clicking it can't yank
the hero back to the start room or drop their held item outside of an
actual death.

Earlier: **user request: "we need board editors on everything, and on adventure I
need an individual board editor not just how to organize the boards."**
The admin editor's position grid (drag rooms, recolour them) previously
had no way to edit a room's actual interior layout — added a per-room
wall canvas (`/admin/games/?game=adventure`, select a room then drag to
draw/erase interior walls), operating on the same `ROOMS[id].inner` data
the live game already reads. `ADV_DEFAULT` in the admin file now carries
each room's default walls (copied from the game's own `ROOMS` table,
cross-checked for an exact match by a headless test) instead of just
position/colour, so Reset to default restores walls too. This is the
first game in the broader "board editors on every grid/room-based game"
initiative — see the root HANDOFF.md for the rest of that rollout.

Earlier: **player feedback: "screen needs to be a lot bigger, all arcade games
should be the same size screen."** CSS display cap raised from 380px to
440px — deliberately NOT the usual 480/560 other games use, since this
game's map canvas sits beside the game canvas in a flex row capped at
580px total width; 440px is the largest cap that still leaves room for
the 120px map + gap without wrapping it below (an earlier, deliberate
"map beside the canvas" layout fix — see further down). No click/touch
coordinate mapping exists in this game (movement is D-pad/keyboard
only), so the fix is purely a backing-store scale-up for
devicePixelRatio, same non-invasive pattern as missilecommand/minigolf.

**Still open, newly reported this same round:** "there needs to be a
restart button beside New Game, so you can restart the same level if you
die without resetting the dead dragons to alive" — not yet started, see
"Open / deferred".

Earlier: **a follow-up round of player feedback, after the previous pass
shipped:**
"We need the dragons to appear where they left off when I reenter a
screen, not reset into the corner." · "if the dragon follows you to the
next room it has to make sense, if he is halfway across the last room he
can't appear right in the doorway in the next room, you have to time it
so it is like he travelled at his particular speed the distance needed
to follow you." · "if a dragon follows me to one room then it has a 90%
chance of following me into each other room."

- Removed the automatic far-corner reset for dragons simply resident in
  a room the hero enters (see "What's here"). This DIRECTLY contradicted
  a small part of the fix below it in the same batch of feedback, so
  read carefully if touching this again: dragons should stay put, full
  stop, not "stay put unless X."
- `chaseDelayFor`/`distToExit` replace the flat `CHASE_DELAY` constant
  with a real distance/speed calculation, computed from the dragon's
  actual position BEFORE it's moved to the doorway spot.
- `CHASE_CHANCE` raised 33%→90%, and `CHASE_DECAY` (added in the
  previous pass, see below) is now a no-op (1) — this later, more
  specific ask for a flat high chance overrides the earlier decay
  design. `chaseStreak` bookkeeping is left in place in case a future
  pass wants decay back.

**Still open from this same round of feedback** (see "Open / deferred"):
a bigger black-castle maze + bridge-as-barrier redesign, the bridge's
visual redesign, and the secret ending's trigger/vertical-text redesign.
The screen-size request (part of a separate, cross-cutting "make every
game the same size" initiative touching several games at once) has since
been resolved — see the top of this section.

Earlier: added the chase-streak decay (`CHASE_DECAY`, now disabled — see
above), doorway-entry positioning for a chasing dragon (`doorwaySpot`),
and triggered-dragon map tracking (`d.triggered`), in response to "once
a dragon follows you to a new room, 100% chance it will keep following
you to new rooms" and "once the dragons are triggered, show them on the
world map."

Earlier still: changed the secret screen's credit text from "CREATED BY"
to "ADAPTED BY" (both `s.msg` and the render-path `ctx.fillText` calls)
— this is a reskin of the original 1979 Atari Adventure's hidden easter
egg, not an original creation, so the wording should say so.

Earlier still: dragon chase behavior added in two steps: first a 25%
chase-into-next-room chance, then a separate 33% chase-on-flee chance
plus the secret 100%-completion ending. Earlier still: moved the
explored-rooms map to sit beside the canvas instead of below it (was
pushing the controls row down awkwardly); separated the black key's
color from other pickups, castle recoloring, a rotating sword sprite,
and title cleanup.

## Open / deferred

Nothing currently open for this game — see "Most recent pass" for the
maze/bridge items that used to be listed here.
