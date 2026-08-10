# Crossy Road (crossyroad) — per-game handoff

Crossy Road-style hopper: cross endless lanes of traffic and rivers,
don't get hit or fall in.

## What's here

- `index.html` — everything. `window.__crossyroad` exposes the pure sim
  for headless testing.
- **Admin-configurable** at `/admin/games/?game=crossyroad`: road/river
  generation — `ROAD_PROB`/`WATER_PROB` (row-type chances), `CAR_SPEED_MIN`/
  `MAX`, `LOG_SPEED_MIN`/`MAX`, `LOG_GAP_MIN`/`MAX`. Uses the site's
  generic numeric-knob config pattern (see kaboom's HANDOFF.md) — saved
  to `localStorage["crossyroad_config"]`, merged into `C` at boot via an
  explicit allowlist.

## Most recent pass

**Numeric-config rollout: crossyroad was the last remaining candidate**,
previously skipped because its difficulty constants (road/water chance,
car/log speed ranges, log gap spacing) were inline `Math.random()`
literals inside `genRow()`, not fields on a `C` object — nothing for a
config pane to read or write. Extracted all 8 into named `C` fields and
rewired `genRow()` to read them; defaults are unchanged (verified the
road/water/grass split over 20,000 generated rows still matches the
original ~42/30/28%). This closes out the site's numeric-knob config
rollout — every game with a `const C={...}` block and real, independent
difficulty constants now has one.

Earlier: addressed as part of a round of player-comment processing shared across
several games (`fix(games): process player comments across six games` /
`fix(games): process player comments (batch 1)` / `fix(games): address
player comments across several games`) — no crossyroad-specific detail
recorded separately from that batch.

## Open / deferred

Nothing currently open for this game.
