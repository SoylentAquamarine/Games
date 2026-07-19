// Shared "Press Spacebar to Begin" gate.
//
// Every action game that uses the standard start overlay (a .overlay holding a
// #start button) gets the same keyboard start as Chickenmania, without each
// game needing its own copy of the logic. Include it after the game script:
//
//   <script src="/startgate.js" defer></script>
//
// Games that draw their own start screen on the canvas do not need this.
(function () {
  // The overlay comes back on game over, so without this the gate would swallow
  // every space typed into the feedback box underneath the game.
  function isTyping(el) {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
  }
  function init() {
    const ov = document.querySelector(".overlay");
    const btn = document.getElementById("start");
    if (!ov || !btn) return;

    // The prompt sits under the button, styled to match the overlay's own text.
    const style = document.createElement("style");
    style.textContent = ".startgate{margin:2px 0 0;font-size:.82rem;letter-spacing:.06em;" +
      "text-transform:uppercase;color:#9a9ab5;animation:sgpulse 1.6s ease-in-out infinite}" +
      "@keyframes sgpulse{0%,100%{opacity:.55}50%{opacity:1}}" +
      "@media (prefers-reduced-motion:reduce){.startgate{animation:none;opacity:.8}}";
    document.head.appendChild(style);

    const p = document.createElement("p");
    p.className = "startgate";
    p.textContent = "Press Spacebar to Begin";
    ov.appendChild(p);

    const showing = () => !ov.classList.contains("hidden") && ov.offsetParent !== null;

    // Capture phase, and swallow the event: otherwise the same press that starts
    // the game also reaches the game's own space handler and fires/flaps/jumps
    // on frame one.
    addEventListener("keydown", (e) => {
      if (e.key !== " " && e.key !== "Enter") return;
      if (isTyping(e.target)) return;      // never eat a space out of the comment box
      if (!showing()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      btn.click();
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
