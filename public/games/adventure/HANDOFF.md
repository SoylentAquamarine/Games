# Chicken Adventure (adventure) — per-game handoff

Atari Adventure-style overworld crawl: rooms on a grid, keys, a sword,
dragons that chase, castles, a 100%-completion secret ending.

## What's here

- `index.html` — everything. `window.__adventure` exposes the pure sim
  (`newGame`, `tick`, `drop`, `respawn`, `dragonStep`, `collide`, `ROOMS`,
  `borderWalls`, `roomWalls`, `LABEL`, `doorwaySpot`, `distToExit`,
  `chaseDelayFor`, `placeDragonsAway`) for headless testing.
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

## Most recent pass

**Player feedback: "there needs to be a restart button beside the new
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

Three items, all from an earlier round of player feedback:

1. **"We need the black castle to have a lot of rooms inside it and to
   be a maze, and we need to have to use the bridge to cross a barrier
   to get to the chalice."** Currently `blackIn` is a single fixed room
   (see the `ROOMS` table) — needs a real multi-room maze interior, plus
   a barrier obstacle inside it that specifically requires carrying the
   bridge to cross. A genuine level-design pass, not a quick tweak.
2. **"The bridge needs to be more like a bridge."** Currently drawn as a
   plain brown rectangle in `drawObject()`'s `"bridge"` case — wants a
   more recognizably bridge-shaped sprite (planks/rails). Small on its
   own, but makes most sense done alongside #1 once there's an actual
   barrier for it to visually span.
3. **"instead of triggering the secret text across the screen with the
   gold castle on it, the secret is the guy enters the gold castle and
   then the secret text is vertical like the warren robinette text is
   in the original game."** Currently the secret-ending text flashes as
   a horizontal overlay on the main play screen the instant you win with
   full completion (see `state.secretWin` in `draw()`). Wants it
   triggered specifically by walking into the Gold Castle, with the
   credit text rendered vertically (one letter per line or rotated),
   matching how the original 1979 Atari Adventure's hidden easter egg
   room actually displayed it.
