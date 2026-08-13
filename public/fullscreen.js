// Drop-in fullscreen toggle for any game page. Include with:
//   <script src="/fullscreen.js" defer></script>
// Every game on the site shares the same top-level `<div class="wrap">`
// container (title, canvas/board, controls, all of it), so this works
// generically without knowing anything about a specific game's layout —
// injects its own styles + a floating corner button that requests
// fullscreen on that wrap. Degrades to nothing (button never appears) on
// browsers/devices without Fullscreen API support (notably iOS Safari).
(function () {
  "use strict";

  function fsEl() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
  }
  function fsEnabled() {
    return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled);
  }
  function requestFs(el) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (fn) return fn.call(el);
  }
  function exitFs() {
    const fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    if (fn) return fn.call(document);
  }

  function injectStyles() {
    const st = document.createElement("style");
    st.textContent = `
      .fs-btn{position:fixed;top:10px;right:10px;z-index:9999;width:36px;height:36px;border-radius:50%;
        background:rgba(15,16,32,.72);border:1px solid rgba(255,255,255,.16);color:#e6e6f0;
        font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;
        cursor:pointer;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
        font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
      .fs-btn:hover{background:rgba(124,92,255,.55);border-color:rgba(124,92,255,.7)}
      .wrap:fullscreen,.wrap:-webkit-full-screen{
        width:100vw!important;height:100vh!important;max-width:none!important;margin:0!important;
        justify-content:center!important;background:#0a0c18;overflow:hidden}
    `;
    document.head.appendChild(st);
  }

  // Player feedback: "i can run full screen now but the actual play field is
  // small, I want the play area to be most of the screen" — followed later
  // by: "full screen games have to have the game contained on the screen
  // without bleeding off the top or bottom or sides."
  //
  // The original approach applied transform:scale() directly to .wrap
  // itself. That broke the moment content got close to filling the screen:
  // .wrap:fullscreen is forced to EXACTLY 100vw x 100vh, so its own box
  // already touches all four edges of the viewport before any transform is
  // applied. Scaling an element that already fills its container by any
  // factor above 1, from its own center, necessarily pushes it past every
  // edge equally (confirmed live: a scale of just 1.05 was enough to blow
  // ~9px off the left/right edges and ~20px off the top/bottom on a phone
  // screen). Shrinking (scale<1) happened to stay safely inside the
  // viewport, which is why this only showed up once content was already
  // close to screen-filling size, not on every game.
  //
  // Fix: .wrap stays fixed at exactly 100vw x 100vh, unscaled, forever —
  // it's purely the fullscreen backdrop + centering box now. Its children
  // are moved once into a new inner wrapper that's inert in normal display
  // (display:contents — zero visual/layout effect, children render exactly
  // as if the wrapper didn't exist) and only becomes a real flex box while
  // fullscreen is active, copying .wrap's own flex-direction/align-items/
  // gap so the game still looks identical, just as a single measurable
  // unit. THAT inner wrapper is what gets scaled — growing from its own
  // (naturally content-sized, safely inside the viewport) center instead
  // of from the edge-to-edge outer box's center.
  function applyFsScale(inner) {
    if (!fsEl()) { inner.style.transform = ""; return; }
    inner.style.transform = "";   // reset first so the measurement below reflects natural (unscaled) size
    const r = inner.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const scale = Math.min(3, Math.min(window.innerWidth / r.width, window.innerHeight / r.height) * 0.96);
    if (scale > 1.02) { inner.style.transform = "scale(" + scale.toFixed(3) + ")"; inner.style.transformOrigin = "center center"; }
  }

  function init() {
    if (!fsEnabled()) return;
    const wrap = document.querySelector(".wrap");
    if (!wrap) return;
    injectStyles();

    const inner = document.createElement("div");
    inner.style.display = "contents";
    while (wrap.firstChild) inner.appendChild(wrap.firstChild);
    wrap.appendChild(inner);

    function syncInnerLayout() {
      if (fsEl()) {
        const cs = getComputedStyle(wrap);
        inner.style.display = "flex";
        inner.style.flexDirection = cs.flexDirection;
        inner.style.alignItems = cs.alignItems;
        inner.style.gap = cs.gap;
      } else {
        inner.style.display = "contents";
      }
    }

    const btn = document.createElement("button");
    btn.className = "fs-btn";
    btn.type = "button";
    btn.title = "Fullscreen";
    btn.setAttribute("aria-label", "Toggle fullscreen");
    btn.textContent = "⛶";
    document.body.appendChild(btn);

    function sync() {
      btn.textContent = fsEl() ? "✕" : "⛶"; btn.title = fsEl() ? "Exit fullscreen" : "Fullscreen";
      syncInnerLayout();
      applyFsScale(inner);
    }
    btn.addEventListener("click", () => { fsEl() ? exitFs() : requestFs(wrap); });
    ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach((evt) =>
      document.addEventListener(evt, sync));
    addEventListener("resize", () => { if (fsEl()) applyFsScale(inner); });
    sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
