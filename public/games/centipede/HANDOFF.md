# Chickenpede (centipede) — per-game handoff

Centipede-style shooter: a segmented train of chickens winds down through
an egg field, shoot segments to split the train, watch for spiders.

## What's here

- `index.html` — everything. `window.__centipede` exposes the pure sim
  (`newState`, `spawnWave`, `ensureCentipede`, `stepCentipede`,
  `segmentAt`, `hitCell`, `killPlayer`, `stepDeath`, `key`, `C`).
- The field is eggs rather than blocks — each takes damage and shows a
  crack once chipped, matching the site's egg motif.
- Every segment (including a lone one-segment train) glides between cells
  instead of snapping — each segment tracks its own previous cell (`pc`,
  `pr`) rather than inferring it from the segment behind, which used to
  break on trains of length 1.
- Waves are separated by a real breather (`waveBreak`) instead of
  respawning instantly. Extras every `EXTRA_EVERY` (5,000) points.
- A flyby cameo drops in every `FLYPAST_EVERY` (5th) wave, drawn via the
  shared `/mascots.js` library (`Mascots.spacesuitChickenFlying`).
- **Admin-configurable** at `/admin/games/?game=centipede`: `CHICKENS`
  (starting lives), `EXTRA_EVERY`, `FLYPAST_EVERY`, and `mushHp` (egg
  toughness) are all editable there. Uses the site's generic numeric-knob
  config pattern (see kaboom's HANDOFF.md for the full explanation) —
  saved to `localStorage["centipede_config"]`, merged into `C` at boot
  via an explicit allowlist.

## Most recent pass

Added the admin config pane described above — no gameplay change to the
defaults.

Earlier: migrated the flyby cameo to `/mascots.js` as part of a
site-wide sweep — see the root `HANDOFF.md`'s mascots.js entry.

Prior passes: only an actual touch on the player's own cell costs a
chicken — a segment merely reaching/zigzagging along the bottom row no
longer auto-kills on proximity alone. Smooth player movement (glides like
the centipede itself), a real death animation (freeze + shake + "CAUGHT"
flash) before the wave resets, and a WAVE-n / chickens-left title card on
every wave start and restart.

## Open / deferred

Nothing currently open for this game.
