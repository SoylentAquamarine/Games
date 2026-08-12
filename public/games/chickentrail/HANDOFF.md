# Chicken Trail (chickentrail) — per-game handoff

Oregon Trail-style journey: lead a flock of chickens 1000 miles to a new
farm, day by day, choosing to Travel, Rest, or Hunt while managing feed,
weariness, and random weather/events.

## What's here

- `index.html` — half text, half graphics: a text log + stat panel (day,
  miles, chickens, feed, weariness, weather) alongside a real `<canvas>`
  strip showing a wagon-chicken icon's position along the trail and a
  weather icon — the third of the 4 requested text-based games (the
  first of the 2 "Oregon Trail" style ones; `huntfox` and `eggheist` are
  the 2 pure-text games, no canvas at all).
- `window.__chickentrail` exposes the pure sim (`TOTAL_DISTANCE`,
  `WEATHER_MULT`, `C` — nested and spread flat, so both
  `G.START_FEED` and `G.C.START_FEED` work — `newGame`, `travel`,
  `rest`, `hunt`, `applyDailyFeed`, `checkOver`, `rollWeather`).
- **Core pressure valve: every day (Travel, Rest, or Hunt — all three)
  the flock eats `chickens × FEED_PER_CHICKEN` feed** (`applyDailyFeed`,
  called first thing inside all three actions). If there isn't enough
  feed, feed clamps to 0 and exactly one chicken starves that day. This
  is deliberately NOT tied to a "starvation event" in the random-event
  pool — it's guaranteed, every single day, regardless of what you do.
- Travel is the only action that advances distance, and rolls weather
  (`WEATHER_MULT` scales the day's distance: clear 1.0, rain 0.8, storm
  0.5, snow 0.6) plus one random event afterward (predator attack,
  spoiled feed, a lucky find, or — only once weariness has reached
  `WEARY_ACCIDENT_AT` (70) — an accident). Weariness rises with travel
  and only falls by resting, which is what makes Rest a real tradeoff
  instead of pure downtime (it still costs a day and still eats feed, at
  half the rate).
- Hunting doesn't move the flock; it has a 75% chance to add 10-40 feed
  on top of that day's mandatory consumption — roughly break-even on
  average, not an infinite-feed exploit.
- Win: reach `TOTAL_DISTANCE` with at least one chicken left. Lose: the
  flock hits zero.

## Most recent pass — beatability rebalance

**Player feedback: "run simulations and see if this game is beatable."**
It wasn't — a Monte Carlo simulation (thousands of runs driving the real
`window.__chickentrail` functions under a few different play styles) found
the original numbers made the 1000-mile journey essentially unwinnable
even with careful play:

- **Feed**: `FEED_PER_CHICKEN=1` meant a full 20-chicken flock needed
  ~20 feed/day while traveling, against a `START_FEED=100` starting
  budget — enough for 5 days. Hunting (75% chance, +10-40 feed) barely
  broke even against that consumption rate even every single day.
- **Predators**: independent of feed, the `predator` event (pool weight
  2, `rnd(1,3)` chickens lost) had an expected cost of ~0.36
  chickens per travel day. A 1000-mile journey needs ~60+ travel days
  at the original ~16.5 mi/day average, so cumulative expected predator
  losses alone (~22 chickens) exceeded the entire 20-chicken starting
  flock — the flock was expected to be wiped out by foxes alone before
  ever running out of feed.
- Simulated win rate with a sensible heuristic (rest before weariness
  gets dangerous, hunt when feed runs thin, otherwise travel): **0.1%**.
  An "always travel, never rest" player: **0%** (though that one's
  actually *intended* — see below).

**Fix**: `START_FEED` 100→130, `FEED_PER_CHICKEN` 1→0.6, the predator
pool weight 2→0.8, and its loss range `rnd(1,3)`→`rnd(1,2)`. Re-simulated
against the real (now-patched) file: the same heuristic now wins
**92.1%** of the time; even a fully random button-masher wins **56.5%**
(a real but much softer floor); "always travel, never rest" is still
**~0%**, confirming that's a deliberate design lesson (weariness caps at
100% and stays there without resting, guaranteeing eventual accidents) —
not the imbalance that was fixed. A regression check (a fixed heuristic
must win >70% over 600 simulated runs) is now part of
`chickentrail-test.js` so a future numbers tweak can't silently
reintroduce the near-unwinnable state.

## Earlier pass

New game, built in response to the same player feedback as `huntfox` and
`eggheist`: "we need 4 text based games, make 2 pure text and 2 half
text half graphics on the screen like oregon trail." This is the third
of the 4 (the first "Oregon Trail" style one). Registered on the home
page's "📖 Text Adventures" category alongside the other two.

## Admin config

`/admin/games/?game=chickentrail` — 4 difficulty knobs registered in
`NUMERIC_CONFIGS` (`public/admin/games/index.html`): `START_FEED`,
`START_CHICKENS`, `FEED_PER_CHICKEN`, `WEARY_ACCIDENT_AT` — exactly
the four values the beatability simulation above tuned. Pulled out of
plain `const` declarations into a mutable `C` object; an IIFE reads
`localStorage.chickentrail_config` on load and overrides any matching
numeric key via an explicit allowlist. `TOTAL_DISTANCE` and the
weariness gain/loss rates stay plain consts, untouched. The shipped
defaults are what `chickentrail-test.js`'s 70%-win-rate regression
check validates — admin overrides only affect that admin's own
localStorage, never the defaults the regression test guards.

## Open / deferred

- Nothing outstanding from the "4 text-based games" comment — the second
  Oregon-Trail-style game shipped as `chickencaravan` (trading/economy
  focus between towns, per the idea noted here previously — deliberately
  NOT a reskin of this survival-focused game).
- Difficulty numbers are now simulation-verified for beatability (see
  above), but still not run past a real human playtester — the specific
  feel (is 92% too easy, is a ~150-day average run too long) is worth a
  player pass.
