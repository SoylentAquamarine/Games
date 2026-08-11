# Chicken Caravan (chickencaravan) — per-game handoff

Oregon Trail-style trading route: buy low, sell high, moving a wagon of
goods between 4 towns; reach $500 by the last stop to win.

## What's here

- `index.html` — half text, half graphics: a text log + stat panel (day,
  cash, wagon fill) alongside a `<canvas>` trail strip showing town
  markers and the caravan's position — the fourth and last of the
  requested text-based games (the second of the 2 "Oregon Trail" style
  ones; `huntfox` and `eggheist` are the 2 pure-text games).
- `window.__chickencaravan` exposes the pure sim (`START_CASH`,
  `WAGON_CAP`, `WIN_TARGET`, `GOODS`, `GOOD_INFO`, `TOWNS`, `newGame`,
  `wagonUsed`, `rollPrices`, `travel`, `buy`, `sell`, `depart`,
  `finishRun`, `plFor`).
- **P/L column**: `s.costBasis[good]` tracks the total $ still invested
  in currently-held units of that good as a running weighted average —
  `buy()` adds the purchase cost to it; `sell()` releases a
  proportional share (`costBasis * qty/wagon[good]`) rather than
  clearing it outright, so partially selling a position leaves an
  accurate basis for what's still held. `plFor(s,good)` returns
  `wagon[good]*prices[good] - costBasis[good]` (0 if nothing's held) —
  the market table's P/L column shows this live, green when positive,
  red when negative, "—" when the good isn't held at all.
- **Deliberately NOT another survival/feed-management loop like
  `chickentrail`** (see that game's HANDOFF.md for why keeping the two
  distinct mattered) — this one is a buy-low-sell-high economy game.
  Two modes: `"travel"` (advancing toward the next town, random bandit/
  lucky-tip events) and `"market"` (at a town, buy/sell 4 goods —
  eggs/feed/wool/tools — at that town's freshly-rolled prices, capped by
  a shared wagon capacity across all 4 goods).
- Win: at the last town (`townsVisited >= TOWNS.length`), call
  `finishRun()` — wins if cash is at or above `WIN_TARGET` ($500). Lose:
  hitting $0 cash with nothing left in the wagon to sell strands the
  caravan (checked every `travel()` call, not just at towns).
- `depart()` is only valid at a non-final town (moves back to `"travel"`
  mode, aimed at the next stop); `finishRun()` is only valid at the
  final town. Neither is available while still on the road.

## Most recent pass

**Player feedback: "there needs to be a P/L column on the buy/sell
screen."** Added — see "P/L column" above.

## Earlier pass

New game, built in response to the same player feedback as the other 3
text games: "we need 4 text based games, make 2 pure text and 2 half
text half graphics on the screen like oregon trail." This closes out all
4 requested games. Registered on the home page's "📖 Text Adventures"
category alongside the other three.

## Open / deferred

- No difficulty-balance feedback yet — starting cash, wagon capacity,
  town count/distances, price ranges, and event odds are all first-draft
  numbers, not tuned against real playtesting (same caveat as
  `chickentrail`).
- The 4-town route and 4 goods are fixed in `TOWNS`/`GOODS`/`GOOD_INFO` —
  easy to extend (more towns, more goods, per-town price bias by good)
  without touching the engine functions.
