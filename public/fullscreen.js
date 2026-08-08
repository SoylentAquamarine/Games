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
  // small, I want the play area to be most of the screen." Every game's
  // canvas/board has its own small px-based CSS size cap, entirely
  // independent of the .wrap container's own width -- simply letting .wrap
  // fill the fullscreen viewport (above) doesn't make that content any
  // bigger, since align-items:center just centers it at its normal small
  // size within the now-huge box. Rather than chase down and override each
  // game's own canvas sizing rule (fragile across ~105 differently-built
  // games), this measures wrap's DIRECT CHILDREN's actual on-screen extent
  // (their natural size, since flex children aren't stretched by
  // align-items:center) and applies a single uniform transform:scale() to
  // .wrap itself so the whole game -- title, canvas, controls, all of it --
  // zooms up together to fill most of the screen, exactly like a browser
  // zoom. Works identically for canvas games and DOM-grid games alike.
  function naturalContentRect(wrap) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, any = false;
    for (const child of wrap.children) {
      const r = child.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      any = true;
      minX = Math.min(minX, r.left); minY = Math.min(minY, r.top);
      maxX = Math.max(maxX, r.right); maxY = Math.max(maxY, r.bottom);
    }
    return any ? { width: maxX - minX, height: maxY - minY } : null;
  }
  function applyFsScale(wrap) {
    if (!fsEl()) { wrap.style.transform = ""; return; }
    wrap.style.transform = "";   // reset first so the measurement below reflects natural (unscaled) size
    const rect = naturalContentRect(wrap);
    if (!rect || !rect.width || !rect.height) return;
    const scale = Math.min(3, Math.min(window.innerWidth / rect.width, window.innerHeight / rect.height) * 0.96);
    if (scale > 1.02) { wrap.style.transform = "scale(" + scale.toFixed(3) + ")"; wrap.style.transformOrigin = "center center"; }
  }

  function init() {
    if (!fsEnabled()) return;
    const wrap = document.querySelector(".wrap");
    if (!wrap) return;
    injectStyles();
    const btn = document.createElement("button");
    btn.className = "fs-btn";
    btn.type = "button";
    btn.title = "Fullscreen";
    btn.setAttribute("aria-label", "Toggle fullscreen");
    btn.textContent = "⛶";
    document.body.appendChild(btn);

    function sync() {
      btn.textContent = fsEl() ? "✕" : "⛶"; btn.title = fsEl() ? "Exit fullscreen" : "Fullscreen";
      applyFsScale(wrap);
    }
    btn.addEventListener("click", () => { fsEl() ? exitFs() : requestFs(wrap); });
    ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach((evt) =>
      document.addEventListener(evt, sync));
    addEventListener("resize", () => { if (fsEl()) applyFsScale(wrap); });
    sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
