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
  // and regalia keep their own colours.
  const COMB = "#dc2626", BEAK = "#f59e0b", GOLD = "#eab308", SHELL = "#f3ead7";
  function faceArt(rank) {
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
      </svg>`;
  }

  function cardEl(card, faceUp) {
    const d = document.createElement("div");
    if (faceUp === false || !card) { d.className = "pcard back"; return d; }
    d.className = "pcard " + (RED[card.suit] ? "red" : "black");
    const lab = rankLabel(card.rank), sym = SUIT_SYMBOL[card.suit];
    const middle = card.rank >= 11 && card.rank <= 13
      ? `<div class="face">${faceArt(card.rank)}</div>`
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
      .pcard.red{color:#dc2626}.pcard.black{color:#15151f}
      .pcard .corner{position:absolute;line-height:.9;text-align:center;font-weight:800;font-size:calc(var(--cw)*0.24);font-family:Georgia,'Times New Roman',serif}
      .pcard .corner span{display:block}
      .pcard .corner.tl{top:5px;left:6px}
      .pcard .corner.br{bottom:5px;right:6px;transform:rotate(180deg)}
      .pcard .pip{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:calc(var(--cw)*0.52)}
      .pcard .face{position:absolute;inset:16% 15% 12%;display:flex;align-items:center;justify-content:center}
      .pcard .face .court{width:100%;height:100%;display:block}
      .pcard.back{background:repeating-linear-gradient(45deg,#3b3f8f 0 6px,#2b2f6f 6px 12px);border:2px solid rgba(255,255,255,.5);
        overflow:hidden}
      .pcard.back::after{content:"";position:absolute;inset:6px;border-radius:5px;border:2px solid rgba(255,255,255,.35)}
      /* No z-index here: lifting it out of flow made the back's chicken paint over
         the face-up card stacked after it. */
      .pcard.back::before{content:"🐔";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        font-size:calc(var(--cw)*0.46);line-height:1}
      .pcard.empty{background:transparent;border:2px dashed rgba(255,255,255,.18);box-shadow:none}
    `;
    document.head.appendChild(s);
  }
  if (typeof document !== "undefined") injectStyles();

  global.Cards = { SUITS, SUIT_SYMBOL, RED, RANKS, rankLabel, makeDeck, shuffle, deal, split, cardEl };
})(typeof window !== "undefined" ? window : globalThis);
