# Quest — per-game handoff

Zelda-style 3×3 dungeon crawler with an overworld, boss fights, and a
level editor (`/admin/games/?game=quest`, "Configuration" panel).

## What's here

- `index.html` — everything: overworld, dungeon rooms, combat, bosses,
  the farmhouse store, coins. `window.__quest` exposes the pure sim for
  headless testing (`makeBoss`, `bossTakeHit`, `BOSSES`, etc.) — see
  `if(typeof document==="undefined") return;` for where the DOM-only part
  starts.
- Dungeon layout is editable per-room from the admin page; edits are
  stored in `localStorage["quest_layout"]` and read on load, falling back
  to the built-in default dungeon (`defaultDungeon()` in the admin page's
  script, mirrored by the in-game layout).

## Most recent pass

Fixed a "fighting Thunder Hawk froze up on me" bug report. Root cause: an
earlier pass added a 0.5s hit-pause on bosses (`b.hurt=30`), but a hit that
lands from a standing position could re-trigger the instant the pause
ended, from the same spot — chaining into a near-permanent stun since the
boss never got a frame to move. Fix: a landed hit now also knocks the boss
back a fixed distance (wall-clamped via `boxHitsSolid`), so the same
standing swing can't auto-reconnect. Diagnosed by source-level reasoning
and headless simulation, not a directly reproduced stack trace — flagged
as such in the commit message.

## Open / deferred

- **"Fight the final boss in the overworld"** (player feedback) — the rest
  of that comment (no enemies in the boss room, boss movement, coins
  counter, farmhouse store) is done. This one sub-ask is deliberately left
  open: it's architecturally ambiguous (does the overworld need a
  dedicated boss-arena zone? does the dungeon room get skipped entirely?)
  and needs the player's design input before implementing, same as the
  precedent set for DK/Kaboom's bigger asks.
