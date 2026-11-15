// Editor semplice: scegli il pezzo, scegli un colore, tocca una parte per colorarla.
// Il disegno completo è tenuto pronto in memoria: passare sopra o colorare costa una sola copia.
(function () {
  const canvas = document.getElementById("editor-tela");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const colore = (nome) => COLORI.find((c) => c.nome === nome);

  const P = (d) => new Path2D(d);
  const rett = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
  const cerchio = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; };
  const arrot = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };

  const cupola = P("M28 142C26 82 62 58 100 58s74 24 72 84Z");
  const code = P("M60 68L96 72L90 168L54 165Z M106 72L142 68L148 165L112 168Z");
  const corpo = P("M30 82h140c6 56-14 96-70 96S24 138 30 82Z");

  // Ogni zona è l'intersezione delle sue forme (spazio 200x200)
  const PRODOTTI = {
    berretta: {
      nome: "Berretta",
      zone: [
        { id: "c1", nome: "cupola alta", forme: [cupola, rett(0, 50, 200, 26)] },
        { id: "c2", nome: "seconda fascia", forme: [cupola, rett(0, 76, 200, 18)] },
        { id: "c3", nome: "terza fascia", forme: [cupola, rett(0, 94, 200, 17)] },
        { id: "c4", nome: "fascia bassa", forme: [cupola, rett(0, 111, 200, 32)] },
        { id: "risvolto", nome: "risvolto", forme: [arrot(20, 128, 160, 44, 20)], coste: true },
        { id: "pompon", nome: "pompon", forme: [cerchio(100, 38, 24)], pompon: true },
      ],
      base: { c1: "Rosso papavero", c2: "Panna", c3: "Rosso papavero", c4: "Panna", risvolto: "Rosso papavero", pompon: "Panna" },
    },
    sciarpotto: {
      nome: "Sciarpotto",
      zone: [
        { id: "f1", nome: "fascia alta", forme: [code, rett(0, 60, 200, 35)] },
        { id: "f2", nome: "seconda fascia", forme: [code, rett(0, 95, 200, 24)] },
        { id: "f3", nome: "terza fascia", forme: [code, rett(0, 119, 200, 24)] },
        { id: "f4", nome: "fascia bassa", forme: [code, rett(0, 143, 200, 30)] },
        { id: "collo", nome: "giro collo", forme: [P("M40 52c36-26 84-26 120 0l-8 30c-32-20-72-20-104 0Z")] },
        { id: "frange", nome: "frange", forme: [P("M50 163h44v34h-44Z M108 163h44v34h-44Z")], frange: true },
      ],
      base: { f1: "Blu Atenir", f2: "Grigio melange", f3: "Blu Atenir", f4: "Grigio melange", collo: "Blu Atenir", frange: "Grigio melange" },
    },
    borsa: {
      nome: "Borsa",
      zone: [
        { id: "manico", nome: "manico", forme: [P("M62 86C56 18 144 18 138 86L124 86C126 40 74 40 76 86Z")] },
        { id: "b1", nome: "fascia alta", forme: [corpo, rett(0, 96, 200, 28)] },
        { id: "b2", nome: "fascia centrale", forme: [corpo, rett(0, 124, 200, 28)] },
        { id: "b3", nome: "fondo", forme: [corpo, rett(0, 152, 200, 30)] },
        { id: "bordo", nome: "bordo", forme: [corpo, rett(0, 80, 200, 16)] },
      ],
      base: { manico: "Girasole", b1: "Girasole", b2: "Girasole", b3: "Girasole", bordo: "Girasole" },
    },
  };

  const ALTEZZA = { pompon: 0, c1: 1, c2: 2, c3: 3, c4: 4, risvolto: 5, collo: 0, f1: 1, f2: 2, f3: 3, f4: 4, frange: 5, manico: 0, bordo: 1, b1: 2, b2: 3, b3: 4 };
  const dallAlto = (p) => [...PRODOTTI[p].zone].sort((a, b) => ALTEZZA[a.id] - ALTEZZA[b.id]);
  const maiuscola = (t) => t[0].toUpperCase() + t.slice(1);

  const stato = {
    prodotto: "berretta",
    pennello: colore("Rosso papavero"),
    colori: Object.fromEntries(Object.entries(PRODOTTI).map(([k, p]) => [k, { ...p.base }])),
    sopra: null,
    storia: [],
  };

  // ----- Disegno -----
  let W = 0, H = 0, s = 1, ox = 0, oy = 0, base = null, anim = 0;

  function misura() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (!w || !h || (w === W && h === H)) return;
    canvas.width = W = w; canvas.height = H = h;
    s = Math.min(W, H) / 200 * 0.88;
    ox = (W - 200 * s) / 2; oy = (H - 200 * s) / 2;
    base = costruisci();
    mostra();
  }
  new ResizeObserver(misura).observe(canvas);

  const spazio = (c) => c.setTransform(s, 0, 0, s, ox, oy);
  const pixel = (c) => c.setTransform(1, 0, 0, 1, 0, 0);
  function ritaglia(c, z) {
    spazio(c);
    z.forme.forEach((f) => c.clip(f));
    pixel(c);
  }

  // Disegna il pezzo intero su una tela in memoria
  function costruisci() {
    const tela = document.createElement("canvas");
    tela.width = W; tela.height = H;
    const c = tela.getContext("2d");
    const p = PRODOTTI[stato.prodotto], col = stato.colori[stato.prodotto];
    for (const z of p.zone) {
      const hex = colore(col[z.id]).valore;
      c.save();
      if (z.frange) {
        spazio(c); c.lineCap = "round"; c.lineWidth = 2.4;
        for (const [x0, x1] of [[56, 88], [114, 146]]) {
          for (let x = x0; x <= x1; x += 4.5) {
            c.strokeStyle = Trama.tono(hex, ((x * 7) % 5) / 25 - 0.1);
            c.beginPath(); c.moveTo(x, 164); c.quadraticCurveTo(x + 1.5, 180, x - 1 + ((x * 3) % 4), 195); c.stroke();
          }
        }
      } else {
        ritaglia(c, z);
        c.fillStyle = c.createPattern(Trama.motivo(hex, 9.5 * s), "repeat");
        c.fillRect(0, 0, W, H);
        spazio(c);
        if (z.pompon) {
          const rnd = Trama.casuale(5);
          c.fillStyle = Trama.tono(hex, -0.1); c.fillRect(70, 10, 60, 60);
          c.lineWidth = 1.2;
          for (let i = 0; i < 220; i++) {
            const a = rnd() * Math.PI * 2, d = rnd() * 22;
            c.strokeStyle = Trama.tono(hex, (rnd() - 0.4) * 0.6);
            c.beginPath();
            c.moveTo(100 + Math.cos(a) * d, 38 + Math.sin(a) * d);
            c.lineTo(100 + Math.cos(a) * (d + 5), 38 + Math.sin(a) * (d + 5));
            c.stroke();
          }
        }
        if (z.coste) {
          c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(20, 128, 160, 44);
          c.strokeStyle = Trama.tono(hex, -0.5); c.globalAlpha = 0.5; c.lineWidth = 1.6;
          for (let x = 26; x < 180; x += 7) { c.beginPath(); c.moveTo(x, 128); c.lineTo(x + 0.5, 172); c.stroke(); }
        }
      }
      c.restore();
    }
    // volume e ombre
    c.save();
    c.globalCompositeOperation = "source-atop";
    const g = c.createRadialGradient(ox + 70 * s, oy + 50 * s, 0, ox + 100 * s, oy + 110 * s, 140 * s);
    g.addColorStop(0, "rgba(255,255,255,.16)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.28)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    spazio(c);
    c.fillStyle = "rgba(0,0,0,.25)";
    if (stato.prodotto === "berretta") c.fillRect(20, 126, 160, 4);
    if (stato.prodotto === "sciarpotto") c.fill(P("M44 86c36-24 76-24 112 0l-3 7c-34-20-72-20-106 0Z"));
    if (stato.prodotto === "borsa") c.fillRect(30, 95, 140, 3);
    c.restore();
    if (stato.prodotto === "borsa") {
      spazio(c);
      c.fillStyle = "#a9794b"; c.beginPath(); c.arc(100, 102, 7.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#c79a6a"; c.beginPath(); c.arc(98.8, 100.8, 5.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#5b3d22";
      for (const [x, y] of [[97.5, 100], [101.3, 100], [97.5, 104], [101.3, 104]]) { c.beginPath(); c.arc(x, y, 1, 0, Math.PI * 2); c.fill(); }
      pixel(c);
    }
    return tela;
  }

  function mostra() {
    if (!base) return;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(base, 0, 0);
    const z = PRODOTTI[stato.prodotto].zone.find((x) => x.id === stato.sopra);
    if (z) {
      ctx.save(); ritaglia(ctx, z);
      ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  // Il nuovo colore sale dal basso verso l'alto, riga dopo riga
  function transizione(prima, zona) {
    cancelAnimationFrame(anim);
    if (!moto || !prima) return mostra();
    const inizio = performance.now(), durata = 420, riga = 9.5 * s * 0.8;
    const passo = (t) => {
      const k = Math.min((t - inizio) / durata, 1), e = 1 - Math.pow(1 - k, 3);
      const y = Math.floor((H * (1 - e)) / riga) * riga;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0);
      if (y > 0) {
        ctx.save();
        if (zona) ritaglia(ctx, zona);
        ctx.beginPath(); ctx.rect(0, 0, W, y); ctx.clip();
        ctx.clearRect(0, 0, W, y);
        ctx.drawImage(prima, 0, 0);
        ctx.restore();
      }
      if (k < 1) anim = requestAnimationFrame(passo); else mostra();
    };
    anim = requestAnimationFrame(passo);
  }

  function colora(ids, nome) {
    const col = stato.colori[stato.prodotto];
    if (ids.every((id) => col[id] === nome)) return;
    stato.storia.push({ prodotto: stato.prodotto, colori: { ...col } });
    if (stato.storia.length > 30) stato.storia.shift();
    ids.forEach((id) => { col[id] = nome; });
    const prima = base;
    base = costruisci();
    const zona = ids.length === 1 ? PRODOTTI[stato.prodotto].zone.find((z) => z.id === ids[0]) : null;
    transizione(prima, zona);
    aggiornaUI();
  }

  // ----- Tocco, mouse e tastiera -----
  function zonaIn(e) {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) * (W / r.width) - ox) / s, y = ((e.clientY - r.top) * (H / r.height) - oy) / s;
    const zone = PRODOTTI[stato.prodotto].zone;
    for (let i = zone.length - 1; i >= 0; i--) {
      if (zone[i].forme.every((f) => ctx.isPointInPath(f, x, y))) return zone[i];
    }
    return null;
  }
  function evidenzia(id) {
    if (id === stato.sopra) return;
    stato.sopra = id;
    mostra();
  }
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const z = zonaIn(e);
    canvas.style.cursor = z ? "pointer" : "default";
    evidenzia(z ? z.id : null);
  });
  canvas.addEventListener("pointerleave", () => evidenzia(null));
  canvas.addEventListener("click", (e) => {
    const z = zonaIn(e);
    if (z) colora([z.id], stato.pennello.nome);
  });
  // tastiera: frecce per scegliere la parte, Invio per colorarla
  canvas.addEventListener("keydown", (e) => {
    const zone = PRODOTTI[stato.prodotto].zone;
    let i = zone.findIndex((z) => z.id === stato.sopra);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") i = (i + 1) % zone.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") i = (i - 1 + zone.length) % zone.length;
    else if ((e.key === "Enter" || e.key === " ") && i >= 0) { e.preventDefault(); colora([zone[i].id], stato.pennello.nome); return; }
    else return;
    e.preventDefault();
    evidenzia(zone[i].id);
    elNota.textContent = `Parte scelta: ${zone[i].nome}. Premi Invio per colorarla.`;
  });
  canvas.addEventListener("blur", () => evidenzia(null));

  // ----- Interfaccia -----
  const elProdotti = document.querySelectorAll("[data-editor-prodotto]");
  const elPennelli = document.getElementById("editor-pennelli");
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

  function scegliProdotto(p) {
    if (p === stato.prodotto) return;
    stato.prodotto = p; stato.sopra = null;
    const prima = base;
    base = costruisci();
    transizione(prima, null);
    aggiornaUI();
  }
  elProdotti.forEach((b) => b.addEventListener("click", () => scegliProdotto(b.dataset.editorProdotto)));
  window.editorProdotto = scegliProdotto;

  const elZone = document.getElementById("editor-zone");
  document.getElementById("editor-righe").addEventListener("click", () => {
    const zone = dallAlto(stato.prodotto), col = stato.colori[stato.prodotto];
    const altro = [...new Set(Object.values(col))].find((n) => n !== stato.pennello.nome) || (stato.pennello.nome === "Panna" ? "Antracite" : "Panna");
    const prima = { ...col };
    stato.storia.push({ prodotto: stato.prodotto, colori: prima });
    zone.forEach((z, i) => { col[z.id] = i % 2 ? altro : stato.pennello.nome; });
    const vecchia = base; base = costruisci(); transizione(vecchia, null); aggiornaUI();
  });
  document.getElementById("editor-tinta").addEventListener("click", () =>
    colora(PRODOTTI[stato.prodotto].zone.map((z) => z.id), stato.pennello.nome));
  document.getElementById("editor-annulla").addEventListener("click", () => {
    const u = stato.storia.pop();
    if (!u) return;
    const prima = u.prodotto === stato.prodotto ? base : null;
    stato.prodotto = u.prodotto; stato.colori[u.prodotto] = u.colori;
    base = costruisci();
    transizione(prima, null);
    aggiornaUI();
  });

  function descrizione() {
    const p = PRODOTTI[stato.prodotto], col = stato.colori[stato.prodotto];
    const usati = [...new Set(Object.values(col))];
    const nome = p.nome.toLowerCase();
    if (usati.length === 1) return `${nome} tutt${stato.prodotto === "sciarpotto" ? "o" : "a"} color ${usati[0].toLowerCase()}`;
    return `${nome} così: ` + p.zone.map((z) => `${z.nome} ${col[z.id].toLowerCase()}`).join(", ");
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
    elRiepilogo.textContent = `${p.nome} · ${[...new Set(Object.values(col))].join(", ")}`;
    elZone.replaceChildren(...dallAlto(stato.prodotto).map((z) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "zona";
      b.innerHTML = `<i style="--c:${colore(col[z.id]).valore}"></i>${maiuscola(z.nome)}`;
      b.title = `Colora: ${z.nome}`;
      b.addEventListener("click", () => colora([z.id], stato.pennello.nome));
      b.addEventListener("pointerenter", () => evidenzia(z.id));
      b.addEventListener("pointerleave", () => evidenzia(null));
      return b;
    }));
    if (CONTATTI.whatsapp) ordinaWa.href = `${link.whatsapp}?text=${encodeURIComponent(messaggio())}`;
    elNota.textContent = "";
  }
  addEventListener("resize", aggiornaUI);
  document.fonts?.ready.then(aggiornaUI);
  aggiornaUI();

  // prepara in anticipo le trame dei colori quando il browser è libero
  const inAnticipo = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  let n = 0;
  (function prepara() {
    if (n >= COLORI.length || !W) { if (!W) setTimeout(prepara, 500); return; }
    Trama.motivo(COLORI[n++].valore, 9.5 * s);
    inAnticipo(prepara);
  })();
})();
