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

  function cardEl(card, faceUp) {
    const d = document.createElement("div");
    if (faceUp === false || !card) { d.className = "pcard back"; return d; }
    d.className = "pcard " + (RED[card.suit] ? "red" : "black");
    const lab = rankLabel(card.rank), sym = SUIT_SYMBOL[card.suit];
    d.innerHTML =
      `<div class="corner tl"><span>${lab}</span><span>${sym}</span></div>` +
      `<div class="pip">${sym}</div>` +
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
      .pcard.back{background:repeating-linear-gradient(45deg,#3b3f8f 0 6px,#2b2f6f 6px 12px);border:2px solid rgba(255,255,255,.5)}
      .pcard.back::after{content:"";position:absolute;inset:6px;border-radius:5px;border:2px solid rgba(255,255,255,.35)}
      .pcard.back::before{content:"🐔";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        font-size:calc(var(--cw)*0.46);line-height:1;z-index:1}
      .pcard.empty{background:transparent;border:2px dashed rgba(255,255,255,.18);box-shadow:none}
    `;
    document.head.appendChild(s);
  }
  if (typeof document !== "undefined") injectStyles();

  global.Cards = { SUITS, SUIT_SYMBOL, RED, RANKS, rankLabel, makeDeck, shuffle, deal, split, cardEl };
})(typeof window !== "undefined" ? window : globalThis);
