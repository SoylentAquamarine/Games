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
      .wrap:fullscreen{background:#0a0c18;max-height:100vh;overflow-y:auto;justify-content:center}
      .wrap:-webkit-full-screen{background:#0a0c18;max-height:100vh;overflow-y:auto;justify-content:center}
    `;
    document.head.appendChild(st);
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

    function sync() { btn.textContent = fsEl() ? "✕" : "⛶"; btn.title = fsEl() ? "Exit fullscreen" : "Fullscreen"; }
    btn.addEventListener("click", () => { fsEl() ? exitFs() : requestFs(wrap); });
    ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach((evt) =>
      document.addEventListener(evt, sync));
    sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
