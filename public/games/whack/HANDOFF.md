# Whack-a-Chicken (whack) — per-game handoff

Whack-a-mole reskin: bonk chickens popping up across 9 holes in 30
seconds, watch for golden bonus chickens and avoid bombs.

## What's here

- `index.html` — everything. `window.__whack` exposes just `C` (the
  admin-tunable difficulty knobs below) — not a full pure-sim export.
  Uses `/arcade.js` for `Arcade.stats.record("whack", score)`.
- 3 pop types per spawn: regular chicken 🐔 (70% chance, +1), golden
  mole 🌟 (15%, +3), bomb 💣 (15%, −2, floored at 0). Only empty holes are
  eligible to pop (`free = holes.filter(h=>!h.type)`).
- Difficulty ramps within the round: each pop's on-screen lifetime
  shrinks (`life=Math.max(C.MOLE_LIFE_MIN,1200-(C.GAME_TIME-time)*20)`)
  and the delay between spawns shrinks
  (`Math.max(C.POP_INTERVAL_MIN,750-(C.GAME_TIME-time)*12)`) as the
  timer counts down, so later in the round chickens appear faster and
  vanish quicker.
- Best score persisted to `localStorage["whack_best"]`.

## Most recent pass

Bug-hunt pass (headless repro + fix): each hole's pop-expiry `setTimeout`
(`pop()`, `h.timer=setTimeout(...)`) was never cancelled when the hole's
state changed elsewhere — not on a successful `whack()`, and not in
`end()` (which only cleared `popTimer`/`tickTimer`, then reset every
hole's `type` to `null` directly). The expiry callback's only guard was
`if(h.type===type)`, comparing against the type it closed over. If the
same hole got reused with the *same* type before that old timer fired —
very plausible either immediately after a whack (hole goes free right
away and can be re-popped within its own leftover life window) or across
an end-of-round replay (a mole popped near the round's last second can
still have up to ~1.2s of life left when `end()` fires) — the stale timer
would fire later and wrongly wipe the brand-new, unwhacked mole
(`classList.remove("up")`, `type=null`) well before its own life elapsed
or the player got a fair shot at it.

Fixed by tracking the timer id on the hole itself (`h.timer`) and
explicitly `clearTimeout`ing it in `whack()` and in `end()`'s per-hole
reset loop, so a hole's expiry timer never outlives the state it was
scheduled for. Repro + fix verified headless (scratchpad
`whack-stale-timer-test.js`, not part of this repo).

## Admin config

`/admin/games/?game=whack` — 3 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `GAME_TIME`
(round length), `POP_INTERVAL_MIN`, `MOLE_LIFE_MIN` (both endgame
intensity floors for the ramps described above). Pulled out of inline
magic numbers into a mutable `C` object; an IIFE reads
`localStorage.whack_config` on load and overrides any matching
numeric key via an explicit allowlist. `HOLES` (board size) stays a
plain const — structural, not a difficulty knob.

## Open / deferred

- A scratchpad regression test (`whack-stale-timer-test.js`, not part
  of this repo) that checks the stale-per-hole-timer fix above is
  currently failing, and reproduces identically against the
  pre-this-session committed source — so it's a pre-existing issue,
  not something this pass introduced. Flagged separately for
  investigation (spawned background task, 2026-08-11).
