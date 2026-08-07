# Chicken Hunt (duckhunt) — per-game handoff

Duck Hunt-style shooting gallery: two alternating boards (flying chickens /
egg-skeet thrower), rounds of 8 birds each, Rooster Reg wandering through
as a friend you shouldn't shoot.

## What's here

- `index.html` — everything. `window.__duckhunt` exposes the pure sim
  (`newState`, `step`, `shoot`, `spawnDuck`, `spawnEgg`, `spawnRooster`,
  `spawnFlyby`, `diffMult`, `C`).
- A round is a solid block of `ROUND_SIZE` (8) birds on ONE board, then a
  title card, then the other board — boards alternate by round number
  (`s.board = s.round%2===1 ? 0 : 1`), not mixed bird-to-bird.
- Difficulty ramps a flat `DIFF_STEP` (10%) per round via `diffMult()`.
- **Admin-configurable** at `/admin/games/?game=duckhunt`: `AMMO` (shots
  per duck), `SPEED` (duck speed), `LIVES`, `ROO_PENALTY`. Uses the
  site's generic numeric-knob config pattern (see kaboom's HANDOFF.md) —
  saved to `localStorage["duckhunt_config"]`, merged into `C` at boot
  via an explicit allowlist.
- **Rooster Reg is now drawn from the shared `/mascots.js` library**
  (`Mascots.rooster`) instead of an inline copy — see mascots.js's own
  comments. This is the exact character the original mascot-library
  player comment named ("the rooster, like in duck hunt clone"); other
  games can now reuse him as a "friend, don't shoot him" cameo.

## Most recent pass

Two player comments:

1. **"gravity is too much on the skeet round, kill gravity by 33%"** —
   `EGG_GRAVITY` 0.22 → 0.147.
2. **"space chicken bonus round started while the screen was still dim
   then didn't respond properly, we need the space chicken to fly by all
   the way off the screen before the next round starts"** — the round
   title card (which blocks shooting via `s.roundTitleT>0`) used to
   expire on its fixed `ROUND_TITLE` timer regardless of whether the
   flyby was still mid-flight (the flyby moves every frame even during
   the title, but the title itself only lasts 110 frames while a full
   crossing takes ~240). Fixed in `step()`: the title now holds at 1
   (still blocking, still visually shown) for as long as `s.flyby` is
   truthy, only finishing the countdown once the flyby has genuinely
   cleared. See the inline comment right above the fix for the exact
   mechanics.

Earlier: extracted Rooster Reg into `/mascots.js` as `Mascots.rooster` —
no gameplay change, purely de-duplicating what would otherwise become a
copy-pasted sprite the moment a second game wants him.

Earlier still: added the admin config pane described above — no
gameplay change to the defaults.

Earlier pass — **bug**: "the egg skeet are not launching onto the board, they are barely
appearing at the bottom of the screen." A prior easing pass (meant to slow
the egg-skeet arc's pace) took the launch speeds from 3.2/6.5 down to
1.6/4.0 — but peak arc height scales with `vy^2/(2*gravity)`, so halving
`vy` quartered the visible height along with the pace. At `vy=4.0` the egg
only rose ~36px into a ~278px-tall sky. Retuned to 2.8/7.0: still under the
original (too-fast) base — keeping the eased-down pace — but with a real
~110px arc now.

## Open / deferred

Nothing currently open for this game.
