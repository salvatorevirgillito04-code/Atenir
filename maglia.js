// Disegna una trama di maglia realistica su <canvas>, ritagliata nella forma del pezzo.
// Le forme sono descritte in uno spazio 200x200 e scalate alla tela.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    // fibre del filato
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

  function trama(ctx, w, h, colore, punto, seme) {
    const rnd = casuale(seme || 11);
    const sh = punto * 0.8;
    ctx.fillStyle = tono(colore, -0.55);
    ctx.fillRect(0, 0, w, h);
    const righe = Math.ceil(h / sh) + 2, colonne = Math.ceil(w / punto) + 1;
    for (let r = -1; r < righe; r++) {
      for (let c = 0; c < colonne; c++) {
        const x = c * punto + (rnd() - 0.5) * punto * 0.06;
        const y = r * sh + (rnd() - 0.5) * sh * 0.06;
        const v = (rnd() - 0.5) * 0.1;
        ctx.globalAlpha = 1;
        gamba(ctx, x + punto * 0.3, y + sh * 0.5, punto * 0.2, sh * 0.78, 0.62, colore, v);
        gamba(ctx, x + punto * 0.7, y + sh * 0.5, punto * 0.2, sh * 0.78, -0.62, colore, v);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Sagome (spazio 200x200)
  const FORME = {
    berretta(m) {
      m.beginPath(); m.arc(100, 38, 24, 0, Math.PI * 2); m.fill();
      m.fill(new Path2D("M28 142C26 82 62 58 100 58s74 24 72 84Z"));
      m.beginPath(); m.roundRect(20, 128, 160, 44, 20); m.fill();
    },
    sciarpotto(m) {
      m.fill(new Path2D("M34 60c40-30 92-30 132 0l-10 34c-36-24-76-24-112 0Z"));
      m.fill(new Path2D("M118 74l34-2-8 92-34-4Z"));
      m.fill(new Path2D("M62 86l-24 70 30 6 22-64Z"));
    },
    borsetta(m) {
      m.lineWidth = 14; m.lineCap = "round";
      m.stroke(new Path2D("M66 86C62 30 138 30 134 86"));
      m.fill(new Path2D("M30 82h140c6 56-14 96-70 96S24 138 30 82Z"));
    },
  };

  // Dettagli disegnati sopra la trama, dentro la sagoma
  const DETTAGLI = {
    berretta(ctx, colore, rnd) {
      // risvolto a coste
      ctx.save();
      ctx.beginPath(); ctx.roundRect(20, 128, 160, 44, 20); ctx.clip();
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = tono(colore, -0.2); ctx.globalAlpha = 0.35; ctx.fillRect(20, 128, 160, 44);
      ctx.globalAlpha = 0.5; ctx.strokeStyle = tono(colore, -0.5); ctx.lineWidth = 1.6;
      for (let x = 26; x < 180; x += 7) { ctx.beginPath(); ctx.moveTo(x, 128); ctx.lineTo(x + 0.5, 172); ctx.stroke(); }
      ctx.restore();
      // ombra tra cupola e risvolto
      ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.globalAlpha = 0.25; ctx.fillStyle = "#000";
      ctx.fillRect(20, 127, 160, 4); ctx.restore();
      // pompon: tanti fili corti
      ctx.save();
      ctx.beginPath(); ctx.arc(100, 38, 24, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = tono(colore, -0.15); ctx.fillRect(70, 10, 60, 60);
      for (let i = 0; i < 220; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * 22;
        ctx.strokeStyle = tono(colore, (rnd() - 0.4) * 0.6); ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(100 + Math.cos(a) * d, 38 + Math.sin(a) * d);
        ctx.lineTo(100 + Math.cos(a) * (d + 5), 38 + Math.sin(a) * (d + 5));
        ctx.stroke();
      }
      ctx.restore();
    },
    sciarpotto(ctx, colore) {
      ctx.save();
      ctx.strokeStyle = tono(colore, -0.1); ctx.lineCap = "round"; ctx.lineWidth = 2.6;
      const frange = [[114, 162, 111, 186], [121, 163, 119, 188], [128, 163, 127, 188], [135, 164, 135, 189], [142, 165, 143, 188],
        [40, 158, 34, 180], [47, 159, 42, 182], [54, 161, 50, 183], [61, 162, 58, 183]];
      ctx.globalCompositeOperation = "source-over";
      for (const [a, b, c, d] of frange) {
        ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(a + 2, (b + d) / 2, c, d); ctx.stroke();
      }
      ctx.restore();
      // ombra del giro sul collo
      ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.globalAlpha = 0.25; ctx.fillStyle = "#000";
      ctx.fill(new Path2D("M44 94c36-24 76-24 112 0l-3 8c-34-20-72-20-106 0Z")); ctx.restore();
    },
    borsetta(ctx, colore) {
      ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.globalAlpha = 0.28; ctx.fillStyle = "#000";
      ctx.fillRect(30, 80, 140, 6); ctx.restore();
      // bottone in legno
      ctx.save();
      ctx.fillStyle = "#a9794b"; ctx.beginPath(); ctx.arc(100, 92, 8.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c79a6a"; ctx.beginPath(); ctx.arc(98.5, 90.5, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5b3d22";
      for (const [x, y] of [[97, 89.5], [101.5, 89.5], [97, 94], [101.5, 94]]) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
  };

  class Maglia {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.forma = canvas.dataset.forma;
      this.colore = canvas.dataset.colore;
      this.punto = +canvas.dataset.punto || 0;
      this.immagine = null;
      this.animazione = 0;
      this.misura();
      new ResizeObserver(() => { if (this.misura()) this.disegna(); }).observe(canvas);
    }
    misura() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(this.canvas.clientWidth * dpr), h = Math.round(this.canvas.clientHeight * dpr);
      if (!w || !h || (w === this.canvas.width && h === this.canvas.height)) return false;
      this.canvas.width = w; this.canvas.height = h; this.dpr = dpr;
      this.immagine = this.costruisci(this.colore);
      return true;
    }
    costruisci(colore) {
      const W = this.canvas.width, H = this.canvas.height;
      const tela = document.createElement("canvas");
      tela.width = W; tela.height = H;
      const ctx = tela.getContext("2d");
      if (this.forma === "telo") {
        trama(ctx, W, H, colore, (this.punto || 20) * this.dpr, 5);
        // volume morbido: luce in alto a sinistra
        const g = ctx.createRadialGradient(W * 0.25, H * 0.2, 0, W * 0.4, H * 0.4, Math.max(W, H));
        g.addColorStop(0, "rgba(255,255,255,0.12)"); g.addColorStop(1, "rgba(0,0,0,0.22)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        return tela;
      }
      const s = Math.min(W, H) / 200 * 0.86;
      const ox = (W - 200 * s) / 2, oy = (H - 200 * s) / 2;
      trama(ctx, W, H, colore, 9.5 * s, 7);
      // ritaglio nella sagoma
      const maschera = document.createElement("canvas");
      maschera.width = W; maschera.height = H;
      const m = maschera.getContext("2d");
      m.setTransform(s, 0, 0, s, ox, oy);
      m.fillStyle = m.strokeStyle = "#000";
      FORME[this.forma](m);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(maschera, 0, 0);
      // volume
      ctx.globalCompositeOperation = "source-atop";
      const g = ctx.createRadialGradient(ox + 70 * s, oy + 50 * s, 0, ox + 100 * s, oy + 110 * s, 140 * s);
      g.addColorStop(0, "rgba(255,255,255,0.18)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
      ctx.setTransform(s, 0, 0, s, ox, oy);
      DETTAGLI[this.forma](ctx, colore, casuale(3));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      return tela;
    }
    disegna() {
      const { ctx, canvas } = this;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (this.immagine) ctx.drawImage(this.immagine, 0, 0);
    }
    // Cambia colore o forma "lavorando" le nuove righe dal basso verso l'alto
    imposta({ colore = this.colore, forma = this.forma, durata = 900 } = {}) {
      const vecchia = this.immagine;
      this.colore = colore; this.forma = forma;
      this.immagine = this.costruisci(colore);
      this.anima(vecchia, this.immagine, durata);
    }
    // Prima apparizione: la maglia si forma riga dopo riga
    lavora(durata = 1400) {
      this.anima(null, this.immagine, durata);
    }
    anima(vecchia, nuova, durata) {
      cancelAnimationFrame(this.animazione);
      if (reduce || !nuova || durata === 0) return this.disegna();
      const { ctx, canvas } = this, H = canvas.height, W = canvas.width;
      const riga = (this.forma === "telo" ? (this.punto || 20) * this.dpr : Math.min(W, H) / 200 * 0.86 * 9.5) * 0.8;
      const inizio = performance.now();
      const passo = (t) => {
        const p = Math.min((t - inizio) / durata, 1);
        const e = 1 - Math.pow(1 - p, 3);
        const y = Math.max(0, Math.floor((H * (1 - e)) / riga) * riga);
        ctx.clearRect(0, 0, W, H);
        if (vecchia && y > 0) ctx.drawImage(vecchia, 0, 0, W, y, 0, 0, W, y);
        if (H - y > 0) ctx.drawImage(nuova, 0, y, W, H - y, 0, y, W, H - y);
        if (p < 1) this.animazione = requestAnimationFrame(passo);
      };
      this.animazione = requestAnimationFrame(passo);
    }
  }

  window.Maglia = Maglia;
})();
