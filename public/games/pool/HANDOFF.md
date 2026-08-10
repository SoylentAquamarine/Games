# Chicken Pool (pool) — per-game handoff

Billiards: 8-ball, 9-ball, straight billiards, and a mini table variant,
with real cue-ball placement and rail physics.

## What's here

- `index.html` — everything. `window.__pool` exposes the pure sim
  (`inHandZone`, `canPlaceCue`, `placeCue`, `newState`, `rack`, `shoot`,
  `step`, `settle`, `endShot`, `moving`, `tableOf`, and more).
- Free cue-ball placement (not a fixed spot) with a turn/group banner,
  and rail diamonds with the corner-5 banking system explained on-screen
  for players who don't already know it.
- Shares a fix with Chicken Circus from the same pass (`fix(pool): could
  not get out of cue-ball placement into the break` / `fix(chickencircus):
  game no longer halts`) — both were "stuck in a setup state and can't
  progress" bugs, worth checking together if either regresses.
- **Admin-configurable** at `/admin/games/?game=pool`: `FRICTION`
  (roll friction), `MAX_POWER` (max shot power), `CUSHION` (rail
  bounce energy retained). Uses the site's generic numeric-knob config
  pattern (see kaboom's HANDOFF.md) — saved to
  `localStorage["pool_config"]`, merged into `C` at boot via an
  explicit allowlist. Table dimensions (`TABLES[mode].w/h`) are
  deliberately NOT exposed here — they're mode-shape (8-ball/9-ball/
  carom/mini), not a difficulty knob, and editing them would need to
  interact with the per-mode rack layout too.

## Most recent pass

**Numeric-config rollout: pool was a flagged candidate** (root
`HANDOFF.md` — the physics constants are global, not tied to any one
table mode, so unlike the mode-shape dimensions they were safe to wire
up without needing a mode-aware editor). Added the standard three-line
boot-time merge and a `NUMERIC_CONFIGS` entry for `FRICTION`,
`MAX_POWER`, `CUSHION`.

Earlier: **bug fix (found in a code-review pass, not player-reported): scratching
while sinking the 9 in Mini mode softlocked the game.** In solo Mini Pool
(9-ball on the small 4-pocket table), potting the 9-ball on the same shot
the cue ball also scratches fell into the "illegal 9, respot and keep
playing" branch, which respotted the 9-ball but never called
`respotCue()`. The cue ball stayed permanently potted, and `shoot()`
refuses to fire while the cue is potted (this path doesn't arm
ball-in-hand placement), so the game could never be continued. Fixed by
calling `respotCue(s)` alongside `respotNine(s)` whenever this branch
resolves a scratch — joins the "stuck, can't progress" bug class noted
above.

Earlier: rail diamonds drawn on the table plus an in-game explanation of
the corner-5 banking system. Earlier still: fixed being unable to leave
cue-ball placement to start the break (a real progression-blocking bug,
not a cosmetic one); free cue-ball placement with the turn/group banner;
mini table spec and english (spin) corrections.

## Open / deferred

Nothing currently open for this game.
