// Editor: scegli il prodotto e colora ogni parte, anche a più colori.
// Richiede trama.js e script.js (COLORI, CONTATTI, link, moto).
(function () {
  const canvas = document.getElementById("editor-tela");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colore = (nome) => COLORI.find((c) => c.nome === nome);

  const P = (d) => new Path2D(d);
  const rett = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
  const cerchio = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; };
  const arrot = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };

  // Ogni zona è l'intersezione delle sue forme (spazio 200x200), y0-y1 serve all'animazione.
  const cupola = P("M28 142C26 82 62 58 100 58s74 24 72 84Z");
  const code = P("M60 68L96 72L90 168L54 165Z M106 72L142 68L148 165L112 168Z");
  const corpo = P("M30 82h140c6 56-14 96-70 96S24 138 30 82Z");

  const PRODOTTI = {
    berretta: {
      nome: "Berretta",
      zone: [
        { id: "c1", nome: "Cupola, fascia alta", forme: [cupola, rett(0, 50, 200, 26)], y0: 56, y1: 76 },
        { id: "c2", nome: "Cupola, seconda fascia", forme: [cupola, rett(0, 76, 200, 18)], y0: 76, y1: 94 },
        { id: "c3", nome: "Cupola, terza fascia", forme: [cupola, rett(0, 94, 200, 17)], y0: 94, y1: 111 },
        { id: "c4", nome: "Cupola, fascia bassa", forme: [cupola, rett(0, 111, 200, 32)], y0: 111, y1: 142 },
        { id: "risvolto", nome: "Risvolto", forme: [arrot(20, 128, 160, 44, 20)], y0: 128, y1: 172, coste: true },
        { id: "pompon", nome: "Pompon", forme: [cerchio(100, 38, 24)], y0: 14, y1: 62, pompon: true },
      ],
      base: { c1: "Rosso papavero", c2: "Panna", c3: "Rosso papavero", c4: "Panna", risvolto: "Rosso papavero", pompon: "Panna" },
    },
    sciarpotto: {
      nome: "Sciarpotto",
      zone: [
        { id: "f1", nome: "Code, fascia alta", forme: [code, rett(0, 60, 200, 35)], y0: 68, y1: 95 },
        { id: "f2", nome: "Code, seconda fascia", forme: [code, rett(0, 95, 200, 24)], y0: 95, y1: 119 },
        { id: "f3", nome: "Code, terza fascia", forme: [code, rett(0, 119, 200, 24)], y0: 119, y1: 143 },
        { id: "f4", nome: "Code, fascia bassa", forme: [code, rett(0, 143, 200, 30)], y0: 143, y1: 169 },
        { id: "collo", nome: "Giro collo", forme: [P("M40 52c36-26 84-26 120 0l-8 30c-32-20-72-20-104 0Z")], y0: 32, y1: 82 },
        { id: "frange", nome: "Frange", forme: [rett(50, 163, 44, 34), rett(108, 163, 44, 34)], y0: 163, y1: 197, frange: true },
      ],
      base: { f1: "Blu Atenir", f2: "Grigio melange", f3: "Blu Atenir", f4: "Grigio melange", collo: "Blu Atenir", frange: "Grigio melange" },
    },
    borsa: {
      nome: "Borsa",
      zone: [
        { id: "manico", nome: "Manico", forme: [P("M62 86C56 18 144 18 138 86L124 86C126 40 74 40 76 86Z")], y0: 24, y1: 86 },
        { id: "b1", nome: "Corpo, fascia alta", forme: [corpo, rett(0, 96, 200, 28)], y0: 96, y1: 124 },
        { id: "b2", nome: "Corpo, fascia centrale", forme: [corpo, rett(0, 124, 200, 28)], y0: 124, y1: 152 },
        { id: "b3", nome: "Corpo, fondo", forme: [corpo, rett(0, 152, 200, 30)], y0: 152, y1: 180 },
        { id: "bordo", nome: "Bordo", forme: [corpo, rett(0, 80, 200, 16)], y0: 82, y1: 96 },
      ],
      base: { manico: "Girasole", b1: "Girasole", b2: "Girasole", b3: "Girasole", bordo: "Girasole" },
    },
  };

  const stato = {
    prodotto: "berretta",
    pennello: colore("Rosso papavero"),
    colori: Object.fromEntries(Object.entries(PRODOTTI).map(([k, p]) => [k, { ...p.base }])),
    sopra: null,
    storia: [],
    anim: null,
  };

  // ----- Disegno -----
  let W = 0, H = 0, s = 1, ox = 0, oy = 0;
  function misura() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h) return;
    canvas.width = W = w; canvas.height = H = h;
    s = Math.min(W, H) / 200 * 0.88;
    ox = (W - 200 * s) / 2; oy = (H - 200 * s) / 2;
    disegna();
  }
  new ResizeObserver(misura).observe(canvas);

  function clipZona(z, extra) {
    ctx.setTransform(s, 0, 0, s, ox, oy);
    if (z.frange) {
      const p = new Path2D(); z.forme.forEach((f) => p.addPath(f)); ctx.clip(p);
    } else z.forme.forEach((f) => ctx.clip(f));
    if (extra) ctx.clip(extra);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function riempi(z, hex) {
    if (z.frange) {
      ctx.setTransform(s, 0, 0, s, ox, oy);
      ctx.lineCap = "round";
      for (const [x0, x1] of [[56, 88], [114, 146]]) {
        for (let x = x0; x <= x1; x += 4.5) {
          ctx.strokeStyle = Trama.tono(hex, ((x * 7) % 5) / 25 - 0.1);
          ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(x, 164); ctx.quadraticCurveTo(x + 1.5, 180, x - 1 + ((x * 3) % 4), 195); ctx.stroke();
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      return;
    }
    ctx.drawImage(Trama.texture(W, H, hex, 9.5 * s), 0, 0);
    if (z.pompon) {
      ctx.setTransform(s, 0, 0, s, ox, oy);
      const rnd = Trama.casuale(5);
      ctx.fillStyle = Trama.tono(hex, -0.1); ctx.fillRect(70, 10, 60, 60);
      for (let i = 0; i < 260; i++) {
        const a = rnd() * Math.PI * 2, d = rnd() * 22;
        ctx.strokeStyle = Trama.tono(hex, (rnd() - 0.4) * 0.6); ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(100 + Math.cos(a) * d, 38 + Math.sin(a) * d);
        ctx.lineTo(100 + Math.cos(a) * (d + 5), 38 + Math.sin(a) * (d + 5));
        ctx.stroke();
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    if (z.coste) {
      ctx.setTransform(s, 0, 0, s, ox, oy);
      ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(20, 128, 160, 44);
      ctx.strokeStyle = Trama.tono(hex, -0.5); ctx.globalAlpha = 0.5; ctx.lineWidth = 1.6;
      for (let x = 26; x < 180; x += 7) { ctx.beginPath(); ctx.moveTo(x, 128); ctx.lineTo(x + 0.5, 172); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  function disegna(t = performance.now()) {
    if (!W) return;
    const p = PRODOTTI[stato.prodotto], col = stato.colori[stato.prodotto];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    let continua = false;
    for (const z of p.zone) {
      const hex = colore(col[z.id]).valore;
      ctx.save(); clipZona(z); riempi(z, hex); ctx.restore();
      // animazione: il nuovo colore sale riga dopo riga
      const a = stato.anim;
      if (a && a.zone.includes(z.id)) {
        const k = Math.min((t - a.inizio) / 520, 1);
        if (k < 1) {
          continua = true;
          const e = 1 - Math.pow(1 - k, 3);
          const riga = 7.6;
          const y = Math.floor((z.y0 + (z.y1 - z.y0) * (1 - e)) / riga) * riga;
          ctx.save(); clipZona(z, rett(0, -10, 200, Math.max(0, y + 10))); riempi(z, colore(a.prima[z.id]).valore); ctx.restore();
        }
      }
      if (stato.sopra === z.id) {
        ctx.save(); clipZona(z); ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
    }
    // volume
    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    const g = ctx.createRadialGradient(ox + 70 * s, oy + 50 * s, 0, ox + 100 * s, oy + 110 * s, 140 * s);
    g.addColorStop(0, "rgba(255,255,255,.16)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.28)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // ombre di separazione e dettagli
    ctx.setTransform(s, 0, 0, s, ox, oy);
    ctx.fillStyle = "rgba(0,0,0,.25)";
    if (stato.prodotto === "berretta") ctx.fillRect(20, 126, 160, 4);
    if (stato.prodotto === "sciarpotto") ctx.fill(P("M44 86c36-24 76-24 112 0l-3 7c-34-20-72-20-106 0Z"));
    if (stato.prodotto === "borsa") ctx.fillRect(30, 95, 140, 3);
    ctx.restore();
    if (stato.prodotto === "borsa") {
      ctx.setTransform(s, 0, 0, s, ox, oy);
      ctx.fillStyle = "#a9794b"; ctx.beginPath(); ctx.arc(100, 102, 7.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c79a6a"; ctx.beginPath(); ctx.arc(98.8, 100.8, 5.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#5b3d22";
      for (const [x, y] of [[97.5, 100], [101.3, 100], [97.5, 104], [101.3, 104]]) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    if (continua) requestAnimationFrame(disegna); else stato.anim = null;
  }

  // ----- Colorare -----
  function colora(ids, nuovi) {
    const col = stato.colori[stato.prodotto];
    const prima = { ...col };
    const cambiate = ids.filter((id) => col[id] !== nuovi[id]);
    if (!cambiate.length) return;
    stato.storia.push({ prodotto: stato.prodotto, colori: prima });
    if (stato.storia.length > 40) stato.storia.shift();
    cambiate.forEach((id) => { col[id] = nuovi[id]; });
    stato.anim = moto ? { zone: cambiate, prima, inizio: performance.now() } : null;
    disegna();
    aggiornaUI();
  }
  const tutte = () => PRODOTTI[stato.prodotto].zone.map((z) => z.id);
  const uguale = (nome) => Object.fromEntries(tutte().map((id) => [id, nome]));

  function zonaIn(e) {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) * (W / r.width) - ox) / s, y = ((e.clientY - r.top) * (H / r.height) - oy) / s;
    const zone = PRODOTTI[stato.prodotto].zone;
    for (let i = zone.length - 1; i >= 0; i--) {
      if ((zone[i].frange
        ? zone[i].forme.some((f) => ctx.isPointInPath(f, x, y))
        : zone[i].forme.every((f) => ctx.isPointInPath(f, x, y)))) return zone[i];
    }
    return null;
  }
  canvas.addEventListener("pointermove", (e) => {
    const z = zonaIn(e);
    const id = z ? z.id : null;
    canvas.style.cursor = z ? "pointer" : "default";
    if (id !== stato.sopra) { stato.sopra = id; if (!stato.anim) disegna(); }
  });
  canvas.addEventListener("pointerleave", () => { stato.sopra = null; if (!stato.anim) disegna(); });
  canvas.addEventListener("click", (e) => {
    const z = zonaIn(e);
    if (z) colora([z.id], { [z.id]: stato.pennello.nome });
  });

  // ----- Interfaccia -----
  const elProdotti = document.querySelectorAll("[data-editor-prodotto]");
  const elPennelli = document.getElementById("editor-pennelli");
  const elZone = document.getElementById("editor-zone");
  const elPennelloNome = document.getElementById("editor-pennello-nome");
  const elRiepilogo = document.getElementById("editor-riepilogo");
  const elNota = document.getElementById("editor-nota");
  const segmenti = document.querySelector(".editor .segmenti");
  const cursore = document.createElement("span");
  cursore.className = "cursore-segmento";
  segmenti.prepend(cursore);

  COLORI.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "campione";
    b.setAttribute("role", "radio"); b.setAttribute("aria-label", c.nome); b.title = c.nome;
    b.style.setProperty("--c", c.valore);
    b.addEventListener("click", () => { stato.pennello = c; aggiornaUI(); });
    elPennelli.appendChild(b);
  });

  elProdotti.forEach((b) => b.addEventListener("click", () => scegliProdotto(b.dataset.editorProdotto)));
  function scegliProdotto(p) {
    stato.prodotto = p; stato.anim = null; stato.sopra = null;
    disegna(); aggiornaUI();
  }
  window.editorProdotto = scegliProdotto;

  document.getElementById("editor-tinta").addEventListener("click", () => colora(tutte(), uguale(stato.pennello.nome)));
  document.getElementById("editor-righe").addEventListener("click", () => {
    const usati = [...new Set(Object.values(stato.colori[stato.prodotto]))];
    const altro = usati.find((n) => n !== stato.pennello.nome) || "Panna";
    const ids = tutte();
    colora(ids, Object.fromEntries(ids.map((id, i) => [id, i % 2 ? altro : stato.pennello.nome])));
  });
  document.getElementById("editor-caso").addEventListener("click", () => {
    const ids = tutte();
    const scelta = [...COLORI].sort(() => Math.random() - 0.5).slice(0, 3);
    colora(ids, Object.fromEntries(ids.map((id) => [id, scelta[Math.floor(Math.random() * 3)].nome])));
  });
  document.getElementById("editor-annulla").addEventListener("click", () => {
    const u = stato.storia.pop();
    if (!u) return;
    stato.prodotto = u.prodotto; stato.colori[u.prodotto] = u.colori; stato.anim = null;
    disegna(); aggiornaUI();
  });
  document.getElementById("editor-scarica").addEventListener("click", () => {
    const out = document.createElement("canvas");
    out.width = W; out.height = H;
    const o = out.getContext("2d");
    o.fillStyle = "#f4f3ef"; o.fillRect(0, 0, W, H); o.drawImage(canvas, 0, 0);
    const a = document.createElement("a");
    a.download = `atenir-${stato.prodotto}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  });

  function descrizione() {
    const p = PRODOTTI[stato.prodotto], col = stato.colori[stato.prodotto];
    const usati = [...new Set(Object.values(col))];
    if (usati.length === 1) return `${p.nome.toLowerCase()} tutta color ${usati[0].toLowerCase()}`.replace("sciarpotto tutta", "sciarpotto tutto");
    return `${p.nome.toLowerCase()} così: ` + p.zone.map((z) => `${z.nome.toLowerCase()} ${col[z.id].toLowerCase()}`).join("; ");
  }
  function messaggio() {
    const art = stato.prodotto === "sciarpotto" ? "uno" : "una";
    return `Ciao! Ho creato un modello sul sito di Atenir, vorrei ${art} ${descrizione()}. Mi dici prezzo e tempi?`;
  }

  const ordinaIg = document.getElementById("editor-instagram");
  ordinaIg.href = link.instagramDm;
  ordinaIg.target = "_blank"; ordinaIg.rel = "noopener";
  ordinaIg.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(messaggio()); elNota.textContent = "Descrizione copiata: incollala nella chat di Instagram."; }
    catch { elNota.textContent = messaggio(); }
  });
  const ordinaWa = document.getElementById("editor-whatsapp");
  if (!CONTATTI.whatsapp) ordinaWa.remove();

  function aggiornaUI() {
    const p = PRODOTTI[stato.prodotto], col = stato.colori[stato.prodotto];
    elProdotti.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.editorProdotto === stato.prodotto)));
    const attivo = segmenti.querySelector('[aria-checked="true"]');
    cursore.style.width = `${attivo.offsetWidth}px`;
    cursore.style.transform = `translateX(${attivo.offsetLeft}px)`;
    elPennelli.querySelectorAll(".campione").forEach((b) =>
      b.setAttribute("aria-checked", String(b.getAttribute("aria-label") === stato.pennello.nome)));
    elPennelloNome.textContent = stato.pennello.nome;
    elZone.replaceChildren(...p.zone.map((z) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "zona";
      b.innerHTML = `<i style="--c:${colore(col[z.id]).valore}"></i>${z.nome}`;
      b.title = `Colora ${z.nome.toLowerCase()} di ${stato.pennello.nome.toLowerCase()}`;
      b.addEventListener("click", () => colora([z.id], { [z.id]: stato.pennello.nome }));
      b.addEventListener("pointerenter", () => { stato.sopra = z.id; disegna(); });
      b.addEventListener("pointerleave", () => { stato.sopra = null; disegna(); });
      return b;
    }));
    const usati = [...new Set(Object.values(col))];
    elRiepilogo.textContent = `${p.nome} · ${usati.join(", ")}`;
    if (CONTATTI.whatsapp) ordinaWa.href = `${link.whatsapp}?text=${encodeURIComponent(messaggio())}`;
    elNota.textContent = "";
  }
  addEventListener("resize", aggiornaUI);
  document.fonts?.ready.then(aggiornaUI);
  aggiornaUI();
})();
