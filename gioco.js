// Mini gioco: lavora una sciarpina all'uncinetto a tempo.
// Premi quando il segno è nella zona: maglia perfetta, buona o saltata.
(function () {
  const sezione = document.getElementById("gioco");
  if (!sezione) return;
  const tela = document.getElementById("gioco-tela");
  const ctx = tela.getContext("2d");
  const barra = document.getElementById("gioco-barra");
  const zona = document.getElementById("gioco-zona");
  const segno = document.getElementById("gioco-segno");
  const uncinetto = document.getElementById("gioco-uncinetto");
  const btnPunto = document.getElementById("gioco-punto");
  const btnInizia = document.getElementById("gioco-inizia");
  const schermo = document.getElementById("gioco-schermo");
  const titoloSchermo = document.getElementById("gioco-schermo-titolo");
  const testoSchermo = document.getElementById("gioco-schermo-testo");
  const elPunti = document.getElementById("gioco-punti");
  const elMaglie = document.getElementById("gioco-maglie");
  const elVite = document.getElementById("gioco-vite");
  const elMsg = document.getElementById("gioco-messaggio");
  const elFili = document.getElementById("gioco-fili");

  const COL = 10, RIG = 7, TOT = COL * RIG;
  const FILI = [
    ["Blu Atenir", "Panna"], ["Rosso papavero", "Antracite"], ["Salvia", "Girasole"], ["Viola", "Cielo"],
  ].map((c) => c.map((n) => COLORI.find((x) => x.nome === n).valore));
  let filo = 0;

  let g = null; // stato partita
  let record = 0;
  try { record = +localStorage.getItem("atenir-record") || 0; } catch {}

  FILI.forEach((f, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "filo-scelta";
    b.setAttribute("aria-label", `Filato ${i + 1}`);
    b.setAttribute("aria-pressed", String(i === 0));
    b.style.setProperty("--a", f[0]); b.style.setProperty("--b", f[1]);
    b.addEventListener("click", () => {
      filo = i;
      elFili.querySelectorAll("button").forEach((x, j) => x.setAttribute("aria-pressed", String(j === i)));
      if (!g || g.finita) disegnaAnteprima();
    });
    elFili.appendChild(b);
  });

  // ----- Tela -----
  let W, H, cella, ox, oy;
  function misura() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    tela.width = W = Math.round(tela.clientWidth * dpr);
    tela.height = H = Math.round(tela.clientHeight * dpr);
    cella = Math.min(W / (COL + 1), H / (RIG * 0.8 + 1.4));
    ox = (W - cella * COL) / 2;
    oy = H - (H - cella * 0.8 * RIG) / 2;
    disegna();
  }
  new ResizeObserver(misura).observe(tela);

  // la riga 0 è in basso; le righe dispari si lavorano da destra a sinistra, come nella realtà
  function posizione(i) {
    const r = Math.floor(i / COL), k = i % COL;
    const c = r % 2 ? COL - 1 - k : k;
    return { x: ox + c * cella, y: oy - (r + 1) * cella * 0.8, r, c };
  }

  function disegna(t = performance.now()) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    // trama di base appena accennata
    ctx.fillStyle = "rgba(21,21,21,.05)";
    for (let i = 0; i < TOT; i++) {
      const p = posizione(i);
      ctx.beginPath(); ctx.ellipse(p.x + cella / 2, p.y + cella * 0.4, cella * 0.32, cella * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (!g) return;
    for (let i = 0; i < g.maglie.length; i++) {
      const m = g.maglie[i], p = posizione(i);
      const eta = Math.min((t - m.t) / 260, 1);
      const sc = eta < 1 ? 0.4 + 0.6 * (1 - Math.pow(1 - eta, 3)) + Math.sin(eta * Math.PI) * 0.12 : 1;
      ctx.save();
      ctx.translate(p.x + cella / 2, p.y + cella * 0.4);
      ctx.scale(sc, sc);
      ctx.translate(-cella / 2, -cella * 0.4);
      if (m.tipo === "saltata") {
        ctx.strokeStyle = Trama.tono(m.colore, -0.2); ctx.lineWidth = cella * 0.06; ctx.setLineDash([cella * 0.08, cella * 0.08]);
        ctx.beginPath(); ctx.ellipse(cella / 2, cella * 0.4, cella * 0.26, cella * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
      } else {
        Trama.punto(ctx, 0, 0, cella, m.colore, m.tipo === "perfetta" ? 0.08 : -0.06);
      }
      ctx.restore();
    }
    if (g.maglie.some((m) => t - m.t < 300)) requestAnimationFrame(disegna);
  }

  function disegnaAnteprima() {
    g = { maglie: [], finita: true };
    const t = performance.now() - 1000;
    for (let i = 0; i < COL * 2; i++) g.maglie.push({ tipo: "perfetta", colore: FILI[filo][Math.floor(i / COL) % 2], t });
    disegna();
  }

  // ----- Partita -----
  function nuovaZona() {
    const ampiezza = Math.max(0.1, 0.24 - g.riga * 0.02);
    g.zona = { centro: 0.15 + Math.random() * 0.7, ampiezza };
    zona.style.left = `${(g.zona.centro - ampiezza / 2) * 100}%`;
    zona.style.width = `${ampiezza * 100}%`;
  }

  function spostaUncinetto() {
    const i = Math.min(g.maglie.length, TOT - 1);
    const p = posizione(i);
    const r = tela.getBoundingClientRect(), k = r.width / W;
    uncinetto.style.transform = `translate(${(p.x + cella * 0.5) * k}px, ${(p.y + cella * 0.1) * k}px)`;
  }

  function inizia() {
    g = { maglie: [], punti: 0, vite: 3, riga: 0, fase: Math.random() * 6, velocita: 1.5, finita: false, serie: 0 };
    schermo.hidden = true;
    sezione.classList.add("in-gioco");
    btnPunto.disabled = false;
    btnPunto.focus({ preventScroll: true });
    nuovaZona(); aggiornaHud(); disegna(); spostaUncinetto();
    elMsg.textContent = "Premi quando il segno è nella zona chiara.";
    let prima = performance.now();
    (function ciclo(t) {
      if (!g || g.finita) return;
      g.fase += ((t - prima) / 1000) * g.velocita; prima = t;
      g.pos = (Math.sin(g.fase) + 1) / 2;
      segno.style.left = `${g.pos * 100}%`;
      requestAnimationFrame(ciclo);
    })(prima);
  }

  function punto() {
    if (!g || g.finita) return;
    const d = Math.abs(g.pos - g.zona.centro), meta = g.zona.ampiezza / 2;
    const colore = FILI[filo][g.riga % 2];
    let tipo;
    if (d <= meta * 0.35) { tipo = "perfetta"; g.serie++; g.punti += 3 + Math.min(g.serie, 5); elMsg.textContent = g.serie > 2 ? `Perfetta! Serie di ${g.serie}` : "Perfetta!"; }
    else if (d <= meta) { tipo = "buona"; g.serie = 0; g.punti += 1; elMsg.textContent = "Buona."; }
    else { tipo = "saltata"; g.serie = 0; g.vite--; elMsg.textContent = "Maglia saltata!"; barra.classList.remove("scossa"); void barra.offsetWidth; barra.classList.add("scossa"); }
    g.maglie.push({ tipo, colore, t: performance.now() });
    uncinetto.classList.remove("affonda"); void uncinetto.offsetWidth; uncinetto.classList.add("affonda");
    if (g.maglie.length % COL === 0) { g.riga++; g.velocita += 0.35; if (g.maglie.length < TOT) elMsg.textContent = `Riga ${g.riga} finita, si gira il lavoro.`; }
    aggiornaHud();
    disegna();
    if (g.vite <= 0) return fine(false);
    if (g.maglie.length >= TOT) return fine(true);
    nuovaZona(); spostaUncinetto();
  }

  function fine(vinta) {
    g.finita = true;
    btnPunto.disabled = true;
    sezione.classList.remove("in-gioco");
    const nuovoRecord = g.punti > record;
    if (nuovoRecord) { record = g.punti; try { localStorage.setItem("atenir-record", String(record)); } catch {} }
    titoloSchermo.textContent = vinta ? "Sciarpina finita!" : "Gomitolo finito!";
    testoSchermo.textContent = `${g.maglie.filter((m) => m.tipo !== "saltata").length} maglie lavorate, ${g.punti} punti` +
      (nuovoRecord ? ". Nuovo record!" : `. Record: ${record}.`);
    btnInizia.textContent = "Gioca ancora";
    setTimeout(() => { schermo.hidden = false; }, 700);
  }

  function aggiornaHud() {
    elPunti.textContent = g.punti;
    elMaglie.textContent = `${g.maglie.length}/${TOT}`;
    elVite.textContent = "●".repeat(Math.max(g.vite, 0)) + "○".repeat(3 - Math.max(g.vite, 0));
    elVite.setAttribute("aria-label", `${Math.max(g.vite, 0)} gomitoli rimasti`);
  }

  btnInizia.addEventListener("click", inizia);
  btnPunto.addEventListener("pointerdown", (e) => { e.preventDefault(); punto(); });
  btnPunto.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); punto(); } });
  tela.addEventListener("pointerdown", () => punto());
  addEventListener("keydown", (e) => {
    if (e.code !== "Space" || !g || g.finita) return;
    e.preventDefault();
    if (!e.repeat) punto();
  });

  document.getElementById("gioco-record").textContent = record ? `Il tuo record: ${record} punti` : "";
  disegnaAnteprima();
})();
