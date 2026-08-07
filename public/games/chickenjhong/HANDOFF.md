# Chickenjhong (chickenjhong) — per-game handoff

Mahjong solitaire with chicken-themed tiles: clear pairs of free tiles
until the board is empty.

## What's here

- `index.html` — everything. `window.__chickenjhong` exposes the pure sim
  (`FACES`, `BOARDS`, `isFree`, `freeTiles`, `newBoard`, `dealSolvable`,
  `pairsLeft`, `won`, `anyMoves`, `reshuffle`, `indexBoard`).
- `BOARDS` is an array of layouts — board 1 is solvable-by-construction
  (dealt by pairing tiles from a guaranteed-clearable order, not pure
  random shuffle, so every deal is actually beatable). A board selector
  picks between the available layouts.
- Includes a tile-review page for previewing the tile art.

## Most recent pass

**Player feedback: "the images are faded and not easy to see, make more
clear tileset."** Two changes, both purely in the DOM/canvas rendering
layer (the pure sim in `window.__chickenjhong` is untouched):

1. The canvas backing store was fixed at its logical CSS size (640x480)
   regardless of the device's pixel ratio, so on a high-DPI phone (2-3x)
   the browser had to upscale a lower-res render to fill the physical
   screen — soft, "faded" detail, worst on the small tile-face emoji.
   `LOGICAL_W`/`LOGICAL_H` constants now hold the original 640x480 for
   every draw/layout/click calculation; the actual backing store is
   scaled up by `devicePixelRatio` and the context scaled back down, so
   it renders at full device resolution while all the game-space math
   stays untouched.
2. Tile face glyphs enlarged (22px → 26px) and given a soft drop-shadow,
   so pale emoji (feathers, eggs, stars) read clearly against the light
   tile body instead of blending into it.

Earlier: added a diamond/twin/ring board layout set (4 boards total), on
the way to a stated goal of 20. Original pass: the game itself — mahjong
solitaire with chicken tiles, solvable-by-construction board 1, the
tile-review page, and the boards array built to be extended.

## Open / deferred

- **More board layouts** — 4 of a stated 20-board goal exist so far.
