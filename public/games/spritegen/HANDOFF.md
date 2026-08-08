# Sprite Generator (spritegen) — per-game handoff

Not a game — a pixel-art sprite editor with mirror symmetry, a
procedural random-creature generator, PNG export, and localStorage
save/load.

## What's here

- `index.html` — everything. No `window.__` export — this tool doesn't
  expose a pure sim for headless testing (grepped the file to confirm),
  since it's an editor rather than a game with win/lose state.
- Pixel-grid canvas at selectable resolution (8/16/24/32px square,
  `#size` select), with pencil/fill(bucket)/eraser/eyedropper tools and a
  16-color fixed palette plus a custom color picker.
- 🪞 Mirror mode (on by default) makes every paint/erase stroke mirror
  horizontally (`set()`, `grid[idx(r,SIZE-1-c)]=col`) for symmetric
  sprite creation.
- 🎲 Generate creates a random symmetric "creature": fills the left half
  with random body-color pixels at a density that's lower near the top/
  bottom edges and left border, then adds a darker "edge" outline color
  to any empty cell adjacent to a filled one, mirroring both halves.
- PNG export (`#png`) rasterizes the grid to an offscreen canvas at a
  chosen scale multiplier (8x/16x/32x) and triggers a download. Sprites
  can be saved/loaded by name to `localStorage["spritegen"]` (a
  name→`{size,grid}` map).
- No admin config pane wired up for this tool.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the tool as
originally built.

## Open / deferred

Nothing currently open for this tool.
