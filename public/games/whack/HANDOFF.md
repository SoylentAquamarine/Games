# Whack-a-Chicken (whack) — per-game handoff

Whack-a-mole reskin: bonk chickens popping up across 9 holes in 30
seconds, watch for golden bonus chickens and avoid bombs.

## What's here

- `index.html` — everything. No `window.__` export — this game doesn't
  expose a pure sim for headless testing (grepped the file to confirm).
  Uses `/arcade.js` for `Arcade.stats.record("whack", score)`.
- 3 pop types per spawn: regular chicken 🐔 (70% chance, +1), golden
  mole 🌟 (15%, +3), bomb 💣 (15%, −2, floored at 0). Only empty holes are
  eligible to pop (`free = holes.filter(h=>!h.type)`).
- Difficulty ramps within the 30-second round: each pop's on-screen
  lifetime shrinks (`life=Math.max(600,1200-(30-time)*20)`) and the delay
  between spawns shrinks (`Math.max(350,750-(30-time)*12)`) as the timer
  counts down, so later in the round chickens appear faster and vanish
  quicker.
- Best score persisted to `localStorage["whack_best"]`. No admin config
  pane wired up for this game.

## Most recent pass

No player-feedback pass yet — this HANDOFF.md was created as part of a
documentation sweep (see the root HANDOFF.md's "Per-game HANDOFF.md
rollout" note). Everything under "What's here" reflects the game as
originally built.

## Open / deferred

Nothing currently open for this game.
