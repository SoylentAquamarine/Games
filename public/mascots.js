// Shared mascot chicken library.
//
// Player feedback: "all of the games are going to incorporate the chicken
// in a space suit... either make it a shared library or leave notes
// somewhere as to where the chicken is being used... we need a mascot
// library." Before this file existed, the spacesuit-chicken cameo used in
// bonus rounds and decorative flybys across the site was copy-pasted
// separately into each game — and had already started drifting (e.g. one
// copy was missing the eye detail another had). One canonical drawing
// here means updating the sprite once updates every game that uses it.
//
// Usage: <script src="/mascots.js"></script>, then
//   Mascots.spacesuitChicken(ctx, x, y, r, facing);
// draws centered at (x,y) with "radius" r (the suit body's radius — other
// features like the comb/beak/helmet scale off it), facing right by
// default (pass facing < 0, e.g. -1, to flip it to face left — matches a
// flyby's direction of travel).
//
// A second, more elaborate variant — Mascots.spacesuitChickenFlying(ctx,
// x, y, r, facing) — adds a jetpack flame trail + life-support pack in
// front of the same body/comb/eye/beak/visor, for games where the cameo
// is a shootable bonus target (visibly "flying" under its own power)
// rather than a purely decorative background flyby. Same call signature.
(function (global) {
  "use strict";

  function spacesuitChicken(ctx, x, y, r, facing) {
    ctx.save();
    ctx.translate(x, y);
    if ((facing || 1) < 0) ctx.scale(-1, 1);
    // jetpack/exhaust glow
    ctx.fillStyle = "rgba(251,146,60,.4)";
    ctx.beginPath(); ctx.ellipse(0, r * 1.1, r * 0.4, r * 0.55, 0, 0, 7); ctx.fill();
    // suit body
    ctx.fillStyle = "#f0902a";
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    // comb
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.85, r * 0.16, 0, 7);
    ctx.arc(0, -r * 0.95, r * 0.18, 0, 7);
    ctx.arc(r * 0.3, -r * 0.85, r * 0.16, 0, 7);
    ctx.fill();
    // beak
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(r * 0.7, 0); ctx.lineTo(r * 1.15, r * 0.15); ctx.lineTo(r * 0.7, r * 0.28);
    ctx.closePath(); ctx.fill();
    // eye
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(r * 0.28, -r * 0.2, r * 0.2, 0, 7); ctx.fill();
    ctx.fillStyle = "#0b0c1a";
    ctx.beginPath(); ctx.arc(r * 0.34, -r * 0.2, r * 0.1, 0, 7); ctx.fill();
    // helmet visor rim + glass
    ctx.strokeStyle = "rgba(186,230,253,.9)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 1.3, 0, 7); ctx.stroke();
    ctx.fillStyle = "rgba(186,230,253,.14)";
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 1.3, 0, 7); ctx.fill();
    ctx.restore();
  }

  function spacesuitChickenFlying(ctx, x, y, r, facing) {
    ctx.save();
    ctx.translate(x, y);
    if ((facing || 1) < 0) ctx.scale(-1, 1);
    // jetpack flame trail
    ctx.fillStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, 0); ctx.lineTo(-r * 1.9, -r * 0.5); ctx.lineTo(-r * 1.9, r * 0.5);
    ctx.closePath(); ctx.fill();
    // life-support pack
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(-r * 1.3, -r * 0.7, r * 0.9, r * 1.4);
    // suit body
    ctx.fillStyle = "#f0902a";
    ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, 7); ctx.fill();
    // comb
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.85, r * 0.18, 0, 7);
    ctx.arc(r * 0.05, -r * 0.95, r * 0.2, 0, 7);
    ctx.arc(r * 0.35, -r * 0.85, r * 0.18, 0, 7);
    ctx.fill();
    // eye
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(r * 0.3, -r * 0.2, r * 0.24, 0, 7); ctx.fill();
    ctx.fillStyle = "#0b0c1a";
    ctx.beginPath(); ctx.arc(r * 0.36, -r * 0.2, r * 0.12, 0, 7); ctx.fill();
    // beak
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.moveTo(r * 0.75, 0); ctx.lineTo(r * 1.4, r * 0.18); ctx.lineTo(r * 0.75, r * 0.3);
    ctx.closePath(); ctx.fill();
    // helmet visor rim + glass
    ctx.strokeStyle = "rgba(186,230,253,.85)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 1.35, 0, 7); ctx.stroke();
    ctx.fillStyle = "rgba(186,230,253,.15)";
    ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 1.35, 0, 7); ctx.fill();
    ctx.restore();
  }

  global.Mascots = { spacesuitChicken: spacesuitChicken, spacesuitChickenFlying: spacesuitChickenFlying };
})(typeof window !== "undefined" ? window : globalThis);
