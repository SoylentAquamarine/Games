// Reusable card-game engine.
// Provides a standard deck model, shuffle/deal helpers, and a CSS card-face
// renderer (styles injected on load). Drop-in: include this script, then use
// window.Cards. Other card games (War, Blackjack, Solitaire...) build on it.
(function (global) {
  "use strict";

  const SUITS = ["S", "H", "D", "C"];
  const SUIT_SYMBOL = { S: "♠", H: "♥", D: "♦", C: "♣" };
  const RED = { H: true, D: true, S: false, C: false };
  const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J 12=Q 13=K 14=A
  const RANK_LABEL = { 11: "J", 12: "Q", 13: "K", 14: "A" };

  // Deck themes — swap the deck's colours, card back and face-card chicken
  // portrait style from one place and every card game updates. "Classic" is
  // the standard deck; the rest are chicken-farm sets. Suits always stay the
  // normal ♠♥♦♣ glyphs on the card itself — see cardEl()/SUIT_SYMBOL below —
  // player feedback: "the suits need to remain normal suits but the KQJ
  // cards can have different pictures of the chickens in different styles."
  // Each theme's `face` block instead recolours the King/Queen/Jack portrait
  // and adds a small themed accessory badge, via faceArt() further down.
  //
  // Follow-up player feedback: "the suit colors should be standard red and
  // black for all card sets." Suit colour used to be per-theme (e.g.
  // Barnyard's suits were orange/dark-brown, Sunny Side's amber/navy) — now
  // every theme uses the same classic red/black, matching the classic suit
  // GLYPHS fixed in the pass above. Only the card back and the KQJ portrait
  // still vary by theme.
  const SUIT_RED = "#dc2626", SUIT_BLACK = "#15151f";
  //
  // Follow-up player feedback: "when i said the KQJ should be different for
  // each set I meant the actual image of the chicken should be different,
  // not just to add the design from the back of the card. We also need a
  // space chicken set." Two changes: (1) the small corner badges below are
  // now much bigger, head-mounted themed HEADWEAR (a straw hat, a nest
  // wreath, sunglasses+sun-rays, a leaf crown) sized and positioned off the
  // actual head circle for each rank, instead of a tiny 3-4px accent — a
  // real change to the portrait's silhouette, not just a recolour. (2) a
  // genuinely different SPACE body (helmet/visor/suit, see spaceArt()
  // below) rather than another recolour of the same rooster/hen/cockerel
  // shape — King/Queen/Jack are told apart by a crown/tiara/star badge on
  // the visor instead of a different body pose.
  const THEMES = [
    { id:"classic",  name:"Classic",       back:{glyph:"🐔", a:"#3b3f8f", b:"#2b2f6f"},
      face:{comb:"#dc2626", beak:"#f59e0b", gold:"#eab308", shell:"#f3ead7", accessory:null} },
    { id:"barnyard", name:"Barnyard",      back:{glyph:"🌾", a:"#7a5a2a", b:"#5a3f1c"},
      face:{comb:"#c2410c", beak:"#b45309", gold:"#a16207", shell:"#e7d8b8", accessory:"hat"} },
    { id:"coop",     name:"Coop",          back:{glyph:"🥚", a:"#4a5a7a", b:"#35425c"},
      face:{comb:"#db2777", beak:"#f59e0b", gold:"#fbbf24", shell:"#fce7f3", accessory:"wreath"} },
    { id:"sunny",    name:"Sunny Side",    back:{glyph:"☀️", a:"#b8860b", b:"#8a6508"},
      face:{comb:"#f59e0b", beak:"#78350f", gold:"#fde047", shell:"#fef3c7", accessory:"shades"} },
    { id:"orchard",  name:"Orchard",       back:{glyph:"🌻", a:"#2e7d32", b:"#1b5e20"},
      face:{comb:"#dc2626", beak:"#f59e0b", gold:"#4d7c0f", shell:"#dcfce7", accessory:"leaves"} },
    { id:"space",    name:"Space Chicken", back:{glyph:"🚀", a:"#2a2f6f", b:"#1a1a3a"},
      face:{comb:"#dc2626", beak:"#facc15", gold:"#f5d020", shell:"#bae6fd", accessory:null, space:true} },
  ];
  let active = THEMES[0];
  function themeById(id){ return THEMES.find(t => t.id === id) || THEMES[0]; }
  function getTheme(){ return active; }
  function applyTheme(){
    if (typeof document === "undefined" || !document.documentElement) return;
    const r = document.documentElement.style;
    r.setProperty("--card-red", SUIT_RED); r.setProperty("--card-black", SUIT_BLACK);
    r.setProperty("--card-back-a", active.back.a); r.setProperty("--card-back-b", active.back.b);
    r.setProperty("--card-back-glyph", '"' + active.back.glyph + '"');
  }
  function setTheme(id){ active = themeById(id);
    try { if (typeof localStorage !== "undefined") localStorage.setItem("cards_theme", active.id); } catch (e) {}
    applyTheme(); return active;
  }
  try { if (typeof localStorage !== "undefined") { const saved = localStorage.getItem("cards_theme"); if (saved) active = themeById(saved); } } catch (e) {}

  function rankLabel(r) { return RANK_LABEL[r] || String(r); }

  function makeDeck(opts) {
    opts = opts || {};
    const decks = opts.decks || 1;
    const cards = [];
    let id = 0;
    for (let d = 0; d < decks; d++)
      for (const s of SUITS)
        for (const r of RANKS)
          cards.push({ rank: r, suit: s, id: id++ });
    return cards;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // deal n cards to each of `hands` players; returns array of hands (arrays)
  function deal(deck, hands, n) {
    const out = Array.from({ length: hands }, () => []);
    for (let k = 0; k < n; k++) for (let h = 0; h < hands; h++) { if (deck.length) out[h].push(deck.shift()); }
    return out;
  }

  // split a deck as evenly as possible into `n` piles
  function split(deck, n) {
    const out = Array.from({ length: n }, () => []);
    deck.forEach((c, i) => out[i % n].push(c));
    return out;
  }

  // Court cards: a rooster king, a hen queen and a young cockerel jack.
  // Body art uses currentColor so each takes on its suit colour; combs, beaks
  // and regalia are recoloured per deck theme (see THEMES' `face` block).
  // Each non-classic (earthbound) theme also gets a real head-mounted piece
  // of themed headwear — sized and positioned off the ACTUAL head circle
  // (hx,hy,hr) for whichever rank is being drawn, so it sits right, not a
  // tiny fixed-position corner badge like before. Big enough to change the
  // portrait's outline, not just add a recolour accent.
  function accessoryArt(kind, hx, hy, hr) {
    switch (kind) {
      case "hat": {   // Barnyard: a wide straw hat covering the crown
        const brimY = hy - hr * 1.15, crownY = hy - hr * 1.55;
        return `<g>
          <ellipse cx="${hx}" cy="${brimY.toFixed(1)}" rx="${(hr * 1.55).toFixed(1)}" ry="${(hr * 0.5).toFixed(1)}" fill="#d9a441" stroke="#8a5a1e" stroke-width=".6"/>
          <path d="M${(hx - hr * 0.8).toFixed(1)} ${brimY.toFixed(1)} Q${hx} ${crownY.toFixed(1)} ${(hx + hr * 0.8).toFixed(1)} ${brimY.toFixed(1)} Z" fill="#e8bd6a" stroke="#8a5a1e" stroke-width=".6"/>
          <path d="M${(hx - hr * 0.7).toFixed(1)} ${(brimY - hr * 0.1).toFixed(1)} L${(hx + hr * 0.7).toFixed(1)} ${(brimY - hr * 0.1).toFixed(1)}" stroke="#a16207" stroke-width="1" opacity=".6"/>
        </g>`;
      }
      case "wreath": {   // Coop: a woven straw nest halo around the head
        const n = 8; let dots = "";
        for (let i = 0; i < n; i++) {
          const a = Math.PI * (1.12 + 0.76 * i / (n - 1));
          const x = hx + Math.cos(a) * hr * 1.25, y = hy + Math.sin(a) * hr * 1.25;
          dots += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(hr * 0.32).toFixed(1)}" ry="${(hr * 0.2).toFixed(1)}" fill="#c98a3a" stroke="#7a5222" stroke-width=".4" transform="rotate(${(a * 180 / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
        }
        return `<g>${dots}</g>`;
      }
      case "shades": {   // Sunny Side: sunglasses over the eyes + sun rays fanning behind the head
        const ex = hx + hr * 0.05, ey = hy - hr * 0.05;
        return `<g>
          <rect x="${(ex - hr * 0.75).toFixed(1)}" y="${(ey - hr * 0.32).toFixed(1)}" width="${(hr * 1.35).toFixed(1)}" height="${(hr * 0.56).toFixed(1)}" rx="${(hr * 0.2).toFixed(1)}" fill="#111827" opacity=".92"/>
          <g stroke="#fde047" stroke-width="1" opacity=".85">
            <line x1="${hx.toFixed(1)}" y1="${(hy - hr * 1.5).toFixed(1)}" x2="${hx.toFixed(1)}" y2="${(hy - hr * 1.95).toFixed(1)}"/>
            <line x1="${(hx - hr * 0.95).toFixed(1)}" y1="${(hy - hr * 1.25).toFixed(1)}" x2="${(hx - hr * 1.35).toFixed(1)}" y2="${(hy - hr * 1.6).toFixed(1)}"/>
            <line x1="${(hx + hr * 0.95).toFixed(1)}" y1="${(hy - hr * 1.25).toFixed(1)}" x2="${(hx + hr * 1.35).toFixed(1)}" y2="${(hy - hr * 1.6).toFixed(1)}"/>
          </g>
        </g>`;
      }
      case "leaves": {   // Orchard: a leaf crown fanning across the top of the head
        const n = 5; let leaves = "";
        for (let i = 0; i < n; i++) {
          const a = -Math.PI * 0.92 - Math.PI * 0.66 * i / (n - 1);
          const bx = hx + Math.cos(a) * hr * 0.85, by = hy + Math.sin(a) * hr * 0.85;
          const tx = hx + Math.cos(a) * hr * 1.75, ty = hy + Math.sin(a) * hr * 1.75;
          const mx = ((bx + tx) / 2).toFixed(1), my = ((by + ty) / 2).toFixed(1);
          leaves += `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} Q${(+mx + 2.2).toFixed(1)} ${my} ${tx.toFixed(1)} ${ty.toFixed(1)} Q${(+mx - 2.2).toFixed(1)} ${my} ${bx.toFixed(1)} ${by.toFixed(1)} Z" fill="#4d7c0f" stroke="#14532d" stroke-width=".5"/>`;
        }
        return `<g>${leaves}</g>`;
      }
      default: return "";
    }
  }
  // Space Chicken theme: a genuinely different portrait -- helmet/visor and
  // suit body instead of another recolour of the earthbound rooster/hen/
  // cockerel shape. King/Queen/Jack are told apart by a crown, tiara dots
  // or a star on the visor rather than a different body pose.
  function spaceArt(rank) {
    const rankBadge = rank === 13
      ? `<path d="M17 8 l3-4 3 4 3-4 3 4 3-4 2 4 Z" fill="#f5d020" stroke="#8a6508" stroke-width=".5"/>`
      : rank === 12
        ? `<g fill="#f5d020"><circle cx="27" cy="9" r="2.3"/><circle cx="21" cy="8" r="1.5"/><circle cx="31" cy="8" r="1.5"/></g>`
        : `<path d="M27 6 l1.2 2.4 2.6 .4 -1.9 1.8 .4 2.6 -2.3 -1.2 -2.3 1.2 .4 -2.6 -1.9 -1.8 2.6 -.4 Z" fill="#f5d020"/>`;
    return `
      <svg viewBox="0 0 44 60" class="court" aria-hidden="true">
        <ellipse cx="24" cy="53" rx="7" ry="4" fill="rgba(251,146,60,.35)"/>
        <ellipse cx="24" cy="40" rx="12" ry="14" fill="currentColor"/>
        <circle cx="24" cy="20" r="10" fill="currentColor"/>
        ${rankBadge}
        <path d="M33 20 l7 3 -7 3 Z" fill="#facc15"/>
        <circle cx="27" cy="18" r="1.8" fill="#0b0c1a"/>
        <ellipse cx="20" cy="21" rx="5.5" ry="4.5" fill="#fff" opacity=".3"/>
        <circle cx="24" cy="19" r="13" fill="none" stroke="rgba(186,230,253,.9)" stroke-width="1.6"/>
        <circle cx="24" cy="19" r="13" fill="rgba(186,230,253,.14)"/>
        <rect x="19" y="50" width="2" height="6" fill="#facc15"/><rect x="26" y="50" width="2" height="6" fill="#facc15"/>
      </svg>`;
  }
  function faceArt(rank, theme) {
    const f = (theme && theme.face) || THEMES[0].face;
    if (f.space) return spaceArt(rank);
    const COMB = f.comb, BEAK = f.beak, GOLD = f.gold, SHELL = f.shell;
    if (rank === 13) return `
      <svg viewBox="0 0 44 60" class="court" aria-hidden="true">
        <path d="M14 34 C4 30 2 18 8 12 C8 22 14 26 18 28 Z" fill="currentColor" opacity=".85"/>
        <ellipse cx="24" cy="36" rx="13" ry="11" fill="currentColor"/>
        <circle cx="30" cy="21" r="8" fill="currentColor"/>
        <path d="M22 13 h16 l-3 5 h-10 Z" fill="${GOLD}"/>
        <path d="M22 13 l3-5 3 5 3-5 3 5 3-5 1 5" fill="none" stroke="${GOLD}" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="26" cy="9" r="1.6" fill="${COMB}"/><circle cx="32" cy="9" r="1.6" fill="${COMB}"/>
        <path d="M38 21 l7 3 -7 3 Z" fill="${BEAK}"/>
        <circle cx="37" cy="27" r="2.4" fill="${COMB}"/>
        <circle cx="33" cy="19" r="1.7" fill="#0b0c1a"/>
        <ellipse cx="22" cy="37" rx="6" ry="4" fill="#fff" opacity=".35"/>
        <rect x="20" y="46" width="2" height="6" fill="${BEAK}"/><rect x="27" y="46" width="2" height="6" fill="${BEAK}"/>
        ${f.accessory ? accessoryArt(f.accessory, 30, 21, 8) : ""}
      </svg>`;
    if (rank === 12) return `
      <svg viewBox="0 0 44 60" class="court" aria-hidden="true">
        <path d="M13 36 C5 32 4 22 9 17" fill="none" stroke="currentColor" stroke-width="3" opacity=".8"/>
        <path d="M13 33 C6 27 7 19 12 15" fill="none" stroke="currentColor" stroke-width="3" opacity=".6"/>
        <ellipse cx="24" cy="37" rx="12" ry="11" fill="currentColor"/>
        <circle cx="29" cy="23" r="7.5" fill="currentColor"/>
        <path d="M22 15 l3-4 3 4 3-4 2 4 Z" fill="${GOLD}"/>
        <circle cx="29" cy="10" r="1.8" fill="${COMB}"/>
        <path d="M36.5 23 l6.5 2.5 -6.5 2.5 Z" fill="${BEAK}"/>
        <circle cx="35.5" cy="29" r="2.2" fill="${COMB}"/>
        <circle cx="32" cy="21" r="1.6" fill="#0b0c1a"/>
        <ellipse cx="22" cy="38" rx="5.5" ry="3.6" fill="#fff" opacity=".35"/>
        <ellipse cx="13" cy="50" rx="4" ry="5" fill="${SHELL}" stroke="#c9bda3"/>
        <rect x="21" y="47" width="2" height="5" fill="${BEAK}"/><rect x="27" y="47" width="2" height="5" fill="${BEAK}"/>
        ${f.accessory ? accessoryArt(f.accessory, 29, 23, 7.5) : ""}
      </svg>`;
    return `
      <svg viewBox="0 0 44 60" class="court" aria-hidden="true">
        <path d="M15 34 C8 31 7 24 11 20 C11 27 14 30 18 31 Z" fill="currentColor" opacity=".8"/>
        <ellipse cx="24" cy="36" rx="10.5" ry="10" fill="currentColor"/>
        <circle cx="28" cy="23" r="7" fill="currentColor"/>
        <path d="M24 16 c2-6 8-7 9-3 -3 0 -5 2 -6 4 Z" fill="${GOLD}"/>
        <circle cx="25" cy="15.5" r="1.5" fill="${COMB}"/><circle cx="29" cy="15" r="1.5" fill="${COMB}"/>
        <path d="M35 23 l6 2.5 -6 2.5 Z" fill="${BEAK}"/>
        <circle cx="34" cy="29" r="2" fill="${COMB}"/>
        <circle cx="31" cy="21" r="1.5" fill="#0b0c1a"/>
        <ellipse cx="22" cy="37" rx="5" ry="3.4" fill="#fff" opacity=".35"/>
        <rect x="21" y="45" width="2" height="6" fill="${BEAK}"/><rect x="27" y="45" width="2" height="6" fill="${BEAK}"/>
        ${f.accessory ? accessoryArt(f.accessory, 28, 23, 7) : ""}
      </svg>`;
  }

  function cardEl(card, faceUp) {
    const d = document.createElement("div");
    if (faceUp === false || !card) { d.className = "pcard back"; return d; }
    d.className = "pcard " + (RED[card.suit] ? "red" : "black");
    // Suits are always the normal ♠♥♦♣ glyphs on the card face, regardless of
    // deck theme — player feedback: "the suits need to remain normal suits."
    // Only the King/Queen/Jack portrait (faceArt) varies by theme.
    const lab = rankLabel(card.rank), sym = SUIT_SYMBOL[card.suit];
    const middle = card.rank >= 11 && card.rank <= 13
      ? `<div class="face">${faceArt(card.rank, active)}</div>`
      : `<div class="pip">${sym}</div>`;
    d.innerHTML =
      `<div class="corner tl"><span>${lab}</span><span>${sym}</span></div>` +
      middle +
      `<div class="corner br"><span>${lab}</span><span>${sym}</span></div>`;
    return d;
  }

  function injectStyles() {
    if (document.getElementById("cards-css")) return;
    const s = document.createElement("style");
    s.id = "cards-css";
    s.textContent = `
      .pcard{--cw:64px;width:var(--cw);height:calc(var(--cw)*1.42);border-radius:8px;background:#fbfbfd;
        position:relative;box-shadow:0 2px 6px rgba(0,0,0,.4);border:1px solid rgba(0,0,0,.15);user-select:none;flex:0 0 auto}
      .pcard.red{color:var(--card-red,#dc2626)}.pcard.black{color:var(--card-black,#15151f)}
      .pcard .corner{position:absolute;line-height:.9;text-align:center;font-weight:800;font-size:calc(var(--cw)*0.24);font-family:Georgia,'Times New Roman',serif}
      .pcard .corner span{display:block}
      .pcard .corner.tl{top:5px;left:6px}
      .pcard .corner.br{bottom:5px;right:6px;transform:rotate(180deg)}
      .pcard .pip{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:calc(var(--cw)*0.52)}
      .pcard .face{position:absolute;inset:16% 15% 12%;display:flex;align-items:center;justify-content:center}
      .pcard .face .court{width:100%;height:100%;display:block}
      .pcard.back{background:repeating-linear-gradient(45deg,var(--card-back-a,#3b3f8f) 0 6px,var(--card-back-b,#2b2f6f) 6px 12px);border:2px solid rgba(255,255,255,.5);
        overflow:hidden}
      .pcard.back::after{content:"";position:absolute;inset:6px;border-radius:5px;border:2px solid rgba(255,255,255,.35)}
      /* No z-index here: lifting it out of flow made the back's chicken paint over
         the face-up card stacked after it. */
      .pcard.back::before{content:var(--card-back-glyph,"🐔");position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        font-size:calc(var(--cw)*0.46);line-height:1}
      .pcard.empty{background:transparent;border:2px dashed rgba(255,255,255,.18);box-shadow:none}
    `;
    document.head.appendChild(s);
  }
  if (typeof document !== "undefined") { injectStyles(); applyTheme(); }

  global.Cards = { SUITS, SUIT_SYMBOL, RED, RANKS, rankLabel, makeDeck, shuffle, deal, split, cardEl, THEMES, getTheme, setTheme, SUIT_RED, SUIT_BLACK };
})(typeof window !== "undefined" ? window : globalThis);
