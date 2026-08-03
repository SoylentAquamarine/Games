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

  // Rooster Reg — a friendly, walking rooster cameo. First built for Duck
  // Hunt's "he's a friend, don't shoot him" mechanic; extracted here per
  // the original mascot-library request naming this exact character
  // ("the rooster, like in duck hunt clone"). Unlike the spacesuit
  // chicken (a decorative flyby/shootable-bonus target), Rooster Reg is
  // meant to be a character you're told NOT to interact with — games
  // reusing him should keep that "friend, not a target" framing.
  //
  // (x,y) is his ground/feet reference point — everything else is drawn
  // relative to it, matching how the original duckhunt code positioned
  // him. w/h are his footprint size (duckhunt uses C.ROO_W/C.ROO_H).
  // facing < 0 flips him to face left. `step` (an incrementing frame
  // counter) drives the walking bob/stride animation; pass `hit: true`
  // once he's been "shot" to freeze the stride and swap his eye for an X.
  function rooster(ctx, x, y, w, h, facing, step, hit) {
    ctx.save();
    ctx.translate(x, y);
    if ((facing || 1) < 0) ctx.scale(-1, 1);
    const bob = hit ? 0 : Math.sin((step || 0) / 7) * 2;
    ctx.translate(0, bob);
    // legs, striding
    const stride = hit ? 0 : Math.sin((step || 0) / 7) * 4;
    ctx.strokeStyle = "#e0a33c"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-2, -h * 0.22); ctx.lineTo(-2 + stride, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -h * 0.22); ctx.lineTo(4 - stride, 0); ctx.stroke();
    // sweeping tail
    ctx.fillStyle = "#1f6f4a";
    ctx.beginPath(); ctx.moveTo(-w * 0.22, -h * 0.42);
    ctx.quadraticCurveTo(-w * 0.72, -h * 1.10, -w * 0.16, -h * 0.86);
    ctx.quadraticCurveTo(-w * 0.44, -h * 0.62, -w * 0.20, -h * 0.36);
    ctx.closePath(); ctx.fill();
    // body
    ctx.fillStyle = "#e8e2d4";
    ctx.beginPath(); ctx.ellipse(0, -h * 0.46, w * 0.30, h * 0.26, 0, 0, 7); ctx.fill();
    // neck + head
    ctx.beginPath(); ctx.ellipse(w * 0.20, -h * 0.72, w * 0.13, h * 0.20, -0.3, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(w * 0.28, -h * 0.88, h * 0.15, 0, 7); ctx.fill();
    // big comb and wattle — clearly not the target
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.arc(w * 0.20, -h * 1.03, h * 0.08, 0, 7); ctx.arc(w * 0.29, -h * 1.08, h * 0.09, 0, 7); ctx.arc(w * 0.38, -h * 1.02, h * 0.08, 0, 7);
    ctx.fill();
    ctx.beginPath(); ctx.ellipse(w * 0.30, -h * 0.74, h * 0.07, h * 0.11, 0, 0, 7); ctx.fill();
    // beak
    ctx.fillStyle = "#f0a72a";
    ctx.beginPath(); ctx.moveTo(w * 0.40, -h * 0.90); ctx.lineTo(w * 0.58, -h * 0.84); ctx.lineTo(w * 0.40, -h * 0.78); ctx.closePath(); ctx.fill();
    // eye — cross if he's been "shot"
    if (hit) {
      ctx.strokeStyle = "#0b0c1a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w * 0.27, -h * 0.94); ctx.lineTo(w * 0.35, -h * 0.86);
      ctx.moveTo(w * 0.35, -h * 0.94); ctx.lineTo(w * 0.27, -h * 0.86); ctx.stroke();
    } else {
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(w * 0.31, -h * 0.90, h * 0.06, 0, 7); ctx.fill();
      ctx.fillStyle = "#0b0c1a"; ctx.beginPath(); ctx.arc(w * 0.33, -h * 0.90, h * 0.03, 0, 7); ctx.fill();
    }
    // wing
    ctx.fillStyle = "#cfc7b4";
    ctx.beginPath(); ctx.ellipse(-w * 0.04, -h * 0.46, w * 0.16, h * 0.13, 0.2, 0, 7); ctx.fill();
    ctx.restore();
  }

  // Hero chicken — the third and last character from the original
  // mascot-library request ("we need the Hero chicken, the mascot
  // chicken, and the rooster... to be standard characters"). Extracted
  // from Quest's existing player-avatar sprite (the site's most
  // developed protagonist design — a 4-directional top-down hero with a
  // trailing tail, comb, and wattle) so other top-down/4-directional
  // games can draw the SAME hero instead of building their own from
  // scratch. Deliberately NOT retrofitted onto every existing game's
  // player sprite here — several games (qbert's hopping avatar, the
  // driving games' car, etc.) have their own established, different
  // player identity, and swapping those out is a bigger visual call than
  // "make a shared character available."
  //
  // (x,y) is the CENTER of the chicken (unlike rooster's feet-reference
  // point). size is roughly the player's hitbox size. dir follows Quest's
  // own convention: 0=up, 1=down, 2=left, 3=right — the sprite is drawn
  // facing +x (right) in its own local frame, then rotated/flipped so the
  // tail always trails behind the direction of travel rather than
  // dragging sideways. No blink/invulnerability flag — like the other
  // two mascots, animation timing (e.g. skipping a draw call to blink)
  // is left to the calling game, not baked into the library.
  function heroChicken(ctx, x, y, size, dir) {
    const s = size;
    ctx.save(); ctx.translate(x, y);
    if (dir === 2) ctx.scale(-1, 1);                 // left
    else if (dir === 0) ctx.rotate(-Math.PI / 2);     // up
    else if (dir === 1) ctx.rotate(Math.PI / 2);      // down
    // dir 3 (right, or dir omitted): drawn as-is, facing +x
    ctx.fillStyle = "#c96f14";                                     // tail feathers (trailing, -x)
    ctx.beginPath(); ctx.moveTo(-s * 0.30, 0); ctx.lineTo(-s * 0.62, -s * 0.24); ctx.lineTo(-s * 0.30, s * 0.26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#facc15";                                     // body
    ctx.beginPath(); ctx.arc(0, 0, s * 0.40, 0, 7); ctx.fill();
    ctx.fillStyle = "#fde68a";                                     // wing
    ctx.beginPath(); ctx.ellipse(-s * 0.02, s * 0.10, s * 0.22, s * 0.13, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#dc2626";                                     // comb, up over the leading head
    ctx.beginPath(); ctx.arc(s * 0.16, -s * 0.34, s * 0.10, 0, 7); ctx.arc(s * 0.28, -s * 0.30, s * 0.11, 0, 7); ctx.arc(s * 0.36, -s * 0.20, s * 0.10, 0, 7); ctx.fill();
    ctx.fillStyle = "#fb923c";                                     // beak, leading (+x)
    ctx.beginPath(); ctx.moveTo(s * 0.40, -4); ctx.lineTo(s * 0.40, 4); ctx.lineTo(s * 0.62, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#dc2626";                                     // wattle under the beak
    ctx.beginPath(); ctx.arc(s * 0.40, s * 0.06, s * 0.05, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s * 0.22, -s * 0.14, s * 0.09, 0, 7); ctx.fill();   // eye white
    ctx.fillStyle = "#0b0c1a"; ctx.beginPath(); ctx.arc(s * 0.26, -s * 0.14, s * 0.05, 0, 7); ctx.fill(); // pupil
    ctx.restore();
  }

  global.Mascots = { spacesuitChicken: spacesuitChicken, spacesuitChickenFlying: spacesuitChickenFlying, rooster: rooster, heroChicken: heroChicken };
})(typeof window !== "undefined" ? window : globalThis);
