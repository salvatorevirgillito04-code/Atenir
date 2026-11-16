// Trama di maglia disegnata su canvas, usata dall'editor.
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

  // Maglia in stile piatto: due "gambe" a capsula che formano una V, poco contrasto, un velo di luce sul lato sinistro.
  function gamba(ctx, x1, y1, x2, y2, larg, colore, v) {
    ctx.lineCap = "round";
    ctx.strokeStyle = tono(colore, v);
    ctx.lineWidth = larg;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.strokeStyle = tono(colore, 0.14 + v);
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = larg * 0.35;
    const sx = x1 < x2 ? -larg * 0.15 : -larg * 0.15;
    ctx.beginPath(); ctx.moveTo(x1 + sx, y1); ctx.lineTo(x2 + sx, y2 - larg * 0.2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Una maglia a V nella cella (x, y), larga s e alta s * 0.8; le V si incastrano con la riga sopra
  function punto(ctx, x, y, s, colore, v = 0) {
    const sh = s * 0.8, larg = s * 0.36;
    const cx = x + s / 2, alto = y - sh * 0.05, basso = y + sh * 0.92;
    gamba(ctx, x + s * 0.22, alto, cx - s * 0.03, basso, larg, colore, v + 0.02);
    gamba(ctx, x + s * 0.78, alto, cx + s * 0.03, basso, larg, colore, v - 0.04);
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
    ctx.fillStyle = tono(colore, -0.16);
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
