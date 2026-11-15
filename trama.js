// Trama di maglia disegnata su canvas: usata dall'editor e dal mini gioco.
(function () {
  function rgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  function tono(hex, k) { // k > 0 schiarisce, k < 0 scurisce
    const [r, g, b] = rgb(hex), t = k < 0 ? 0 : 255, p = Math.min(Math.abs(k), 1);
    return `rgb(${Math.round(r + (t - r) * p)},${Math.round(g + (t - g) * p)},${Math.round(b + (t - b) * p)})`;
  }
  function casuale(seme) {
    return () => (seme = (seme * 16807) % 2147483647) / 2147483647;
  }

  function gamba(ctx, cx, cy, rx, ry, rot, colore, v) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
    g.addColorStop(0, tono(colore, 0.3 + v));
    g.addColorStop(0.45, tono(colore, v));
    g.addColorStop(1, tono(colore, -0.32 + v));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = tono(colore, -0.25 + v);
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = Math.max(0.6, rx * 0.12);
    for (const f of [-0.45, 0.05, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(rx * f, -ry * 0.75);
      ctx.quadraticCurveTo(rx * (f + 0.25), 0, rx * f * 0.5, ry * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Una maglia a V nella cella (x, y), larga s e alta s * 0.8
  function punto(ctx, x, y, s, colore, v = 0) {
    const sh = s * 0.8;
    gamba(ctx, x + s * 0.3, y + sh * 0.5, s * 0.2, sh * 0.78, 0.62, colore, v);
    gamba(ctx, x + s * 0.7, y + sh * 0.5, s * 0.2, sh * 0.78, -0.62, colore, v);
  }

  // Piastrella ripetibile: poche decine di maglie invece di migliaia.
  // Le maglie ai bordi usano lo stesso disordine di quelle dal lato opposto, così le giunture non si vedono.
  const COL = 8, RIG = 10;
  function piastrella(colore, s) {
    const sh = s * 0.8, W = Math.round(COL * s), H = Math.round(RIG * sh);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    const rnd = casuale(7), j = [];
    for (let i = 0; i < COL * RIG * 3; i++) j.push(rnd() - 0.5);
    const kx = W / COL, ky = H / RIG;
    ctx.fillStyle = tono(colore, -0.55);
    ctx.fillRect(0, 0, W, H);
    for (let r = -1; r <= RIG; r++) {
      for (let k = -1; k <= COL; k++) {
        const i = (((r % RIG) + RIG) % RIG) * COL + (((k % COL) + COL) % COL);
        punto(ctx, k * kx + j[i * 3] * s * 0.06, r * ky + j[i * 3 + 1] * sh * 0.06, s, colore, j[i * 3 + 2] * 0.1);
      }
    }
    return c;
  }

  const cache = new Map();
  function motivo(colore, s) {
    const k = `${colore}:${Math.round(s * 10)}`;
    if (!cache.has(k)) {
      if (cache.size > 60) cache.clear();
      cache.set(k, piastrella(colore, s));
    }
    return cache.get(k);
  }

  window.Trama = { tono, casuale, punto, motivo };
})();
