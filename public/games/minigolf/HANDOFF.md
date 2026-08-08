# Mini Golf — per-game handoff

18-hole mini golf: drag-back-to-putt physics (walls, sand traps that slow
the ball, water hazards that cost a penalty stroke), a scorecard, and a
full course designer on the admin Game Admin page.

## What's here

- `index.html` — physics + rendering. `window.__minigolf` exposes the pure
  sim (`newState(startLevel)`, `putt`, `stepBall`, `sunk`, `collideWall`,
  `moving`, `inSand`, `inWater`, `C`, `COURSES`, `courseById`,
  `isValidHoles`, plus a live `getLEVELS()` getter for testing — the
  plain `LEVELS` export is just a snapshot taken before the DOM layer
  picks a course, see the comment on it).
- **Courses**: `COURSES` is always headed by the built-in "Classic 18"
  (`DEFAULT_LEVELS`), followed by any named courses saved by the admin
  editor under `localStorage["minigolf_courses"]` (an array of
  `{id,name,holes}`, 18 holes each). The old single-course format
  (`minigolf_levels`) migrates in automatically as one more course
  ("Custom Course") the first time it's seen.
- **Course picker**: shown on load only when there's an actual choice
  (`COURSES.length>1`) and the URL didn't already pick one via
  `?course=<id>` (the admin "Test this hole" button always supplies one,
  bypassing the picker). Offers each named course plus "🎲 Random".
- **Testing a hole from the admin editor**: `?course=<id>&hole=N` jumps
  straight to hole N of that specific course instead of starting the
  whole 18-hole course over from hole 1.
- Traps (sand/water) are irregular blobs (`blobPoints`/`inBlob`), not
  rectangles — the outline is deterministic from the trap's own position
  so the drawn shape and the physics hit-test are always identical.
- **Renders at a bigger, standard-size screen.** `W`/`H` (`C.W`/`C.H`,
  320x420) stay the LOGICAL/gameplay coordinate system — every draw call
  and `pos()`'s click-mapping keep working unchanged. `LOGICAL_W`/
  `LOGICAL_H` capture that size before the canvas backing store is scaled
  up (`RENDER_SCALE=480/LOGICAL_W`) and further scaled for
  `devicePixelRatio`, via a single `ctx.scale()` at setup — the same
  pattern used for missilecommand and chickenjhong.

## Most recent pass

**Player feedback: "screen should be standard video game size."** The
bigger-screen change described above — CSS display cap raised from
420px to 480px (the viewport-height budget term from the earlier
"fit the whole green on screen" pass is untouched), backing store
scaled to match plus devicePixelRatio.

Earlier: **player feedback: "I don't like the striped green background,
make it a solid color, the lighter of the two greens is nice."** The
fairway used to be a mowed-lawn stripe pattern (`#1a5a2a` base with
`#176a2c` stripes every 24px); now a single flat `fillRect` in the
lighter shade. Traps, walls, the hole, and everything else are
unchanged.

## Earlier pass — three rounds of player feedback

1. **"test the board directly from the design page"** — added a
   "▶ Test this hole" button to the admin course editor.
2. **"resize this to the size of the screen, HUD and green all on the
   screen"** — the canvas used to size purely off viewport WIDTH, so a
   short/landscape viewport could push the bottom of the green (and the
   HUD, since `.wrap` was capped at 380px while the canvas could compute
   up to 460px — a mismatch) off-screen. Now sizes off whichever of width
   or height is more constraining, via a `min()` that converts a 60vh
   height budget into an equivalent width at the board's aspect ratio.
3. **"create different courses with names... choose which course... or a
   random course"** — the multi-course system described above. The admin
   editor gained a course `<select>` + New/Delete, each course's holes
   edited independently.

## Open / deferred

Nothing currently open for this game.
