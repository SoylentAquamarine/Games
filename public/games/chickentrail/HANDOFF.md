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
  `START_FEED`, `START_CHICKENS`, `WEATHER_MULT`, `WEARY_ACCIDENT_AT`,
  `newGame`, `travel`, `rest`, `hunt`, `applyDailyFeed`, `checkOver`,
  `rollWeather`).
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

## Most recent pass

New game, built in response to the same player feedback as `huntfox` and
`eggheist`: "we need 4 text based games, make 2 pure text and 2 half
text half graphics on the screen like oregon trail." This is the third
of the 4 (the first "Oregon Trail" style one). Registered on the home
page's "📖 Text Adventures" category alongside the other two.

## Open / deferred

- Nothing outstanding from the "4 text-based games" comment — the second
  Oregon-Trail-style game shipped as `chickencaravan` (trading/economy
  focus between towns, per the idea noted here previously — deliberately
  NOT a reskin of this survival-focused game).
- No difficulty-balance feedback yet — worth a player pass once this one
  has been played a bit (starting feed/chicken counts, weather odds,
  event weights are all first-draft numbers, not tuned against real
  playtesting).
