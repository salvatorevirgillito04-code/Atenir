// Mini gioco: lavora un cuoricino all'uncinetto, 13 maglie.
// Premi quando il segno è nella zona chiara: maglia perfetta, buona o saltata.
(function () {
  const sezione = document.getElementById("gioco");
  if (!sezione) return;
  const $ = (id) => document.getElementById(id);
  const tela = $("gioco-tela"), ctx = tela.getContext("2d");
  const lavoro = $("gioco-lavoro"), barra = $("gioco-barra"), zona = $("gioco-zona"), segno = $("gioco-segno");
  const uncinetto = $("gioco-uncinetto"), btnPunto = $("gioco-punto"), btnInizia = $("gioco-inizia");
  const schermo = $("gioco-schermo"), titoloSchermo = $("gioco-schermo-titolo"), testoSchermo = $("gioco-schermo-testo");
  const elPunti = $("gioco-punti"), elMaglie = $("gioco-maglie"), elVite = $("gioco-vite"), elMsg = $("gioco-messaggio"), elFili = $("gioco-fili");

  // Il cuore, dal basso verso l'alto (5 colonne)
  const FORMA = ["..X..", ".XXX.", "XXXXX", "XX.XX"];
  const COL = 5, RIG = FORMA.length;
  const CELLE = []; // ordine di lavoro: righe alterne avanti e indietro, come nella realtà
  FORMA.forEach((riga, r) => {
    const cols = [...riga].map((ch, c) => (ch === "X" ? c : -1)).filter((c) => c >= 0);
    (r % 2 ? cols.reverse() : cols).forEach((c) => CELLE.push({ r, c }));
  });
  const TOT = CELLE.length;

  const FILI = [["Rosso papavero", "Rosa cipria"], ["Blu Atenir", "Panna"], ["Salvia", "Girasole"], ["Viola", "Cielo"]]
    .map((c) => c.map((n) => COLORI.find((x) => x.nome === n).valore));
  let filo = 0, g = null, record = 0;
  try { record = +localStorage.getItem("atenir-record-cuore") || 0; } catch {}

  FILI.forEach((f, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "filo-scelta";
    b.setAttribute("aria-label", `Filato ${i + 1}`);
    b.setAttribute("aria-pressed", String(i === 0));
    b.style.setProperty("--a", f[0]); b.style.setProperty("--b", f[1]);
    b.addEventListener("click", () => {
      filo = i;
      elFili.querySelectorAll("button").forEach((x, j) => x.setAttribute("aria-pressed", String(j === i)));
      anteprima();
    });
    elFili.appendChild(b);
  });

  // gomitoli come piccoli disegni
  const gomitolo = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M5 8c5 1 10 5 12 12M8 4c6 2 11 8 12 14M14 2.5c-3 5-4 12-2 19" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6" stroke-linecap="round"/></svg>';
  elVite.innerHTML = gomitolo.repeat(3);

  // ----- Tela -----
  let W, H, cella, ox, oy;
  function misura() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    tela.width = W = Math.round(tela.clientWidth * dpr);
    tela.height = H = Math.round(tela.clientHeight * dpr);
    cella = Math.min(W / (COL + 3), H / (RIG * 0.8 + 2.6));
    ox = (W - cella * COL) / 2;
    oy = H - (H - cella * 0.8 * RIG) / 2;
    disegna();
  }
  new ResizeObserver(misura).observe(tela);
  const pos = (i) => { const { r, c } = CELLE[i]; return { x: ox + c * cella, y: oy - (r + 1) * cella * 0.8 }; };

  function disegna(t = performance.now()) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(21,21,21,.06)";
    for (let i = 0; i < TOT; i++) {
      const p = pos(i);
      ctx.beginPath(); ctx.ellipse(p.x + cella / 2, p.y + cella * 0.4, cella * 0.3, cella * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (!g) return;
    let vive = false;
    g.maglie.forEach((m, i) => {
      const p = pos(i), eta = Math.min((t - m.t) / 320, 1);
      if (eta < 1) vive = true;
      const sc = 0.3 + 0.7 * (1 - Math.pow(1 - eta, 3)) + Math.sin(eta * Math.PI) * 0.18;
      ctx.save();
      ctx.translate(p.x + cella / 2, p.y + cella * 0.4); ctx.scale(sc, sc); ctx.translate(-cella / 2, -cella * 0.4);
      if (m.tipo === "saltata") {
        ctx.strokeStyle = Trama.tono(m.colore, -0.15); ctx.lineWidth = cella * 0.06; ctx.setLineDash([cella * 0.08, cella * 0.08]);
        ctx.beginPath(); ctx.ellipse(cella / 2, cella * 0.4, cella * 0.24, cella * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
      } else {
        Trama.punto(ctx, 0, 0, cella, m.colore, m.tipo === "perfetta" ? 0.08 : -0.06);
      }
      ctx.restore();
    });
    if (vive) requestAnimationFrame(disegna);
  }

  function anteprima() {
    if (g && !g.finita) return;
    const t = performance.now() - 1000;
    g = { maglie: CELLE.map((cl) => ({ tipo: "perfetta", colore: FILI[filo][cl.r % 2], t })), finita: true };
    disegna();
  }

  // ----- Partita -----
  function nuovaZona() {
    const amp = Math.max(0.14, 0.28 - g.riga * 0.025);
    g.zona = { centro: 0.18 + Math.random() * 0.64, amp };
    zona.style.transform = `translateX(${(g.zona.centro - amp / 2) * 100 / amp}%) scaleX(1)`;
    zona.style.width = `${amp * 100}%`;
  }
  function spostaUncinetto() {
    const p = pos(Math.min(g.maglie.length, TOT - 1)), k = tela.clientWidth / W;
    uncinetto.style.transform = `translate3d(${(p.x + cella * 0.5) * k}px, ${(p.y + cella * 0.1) * k}px, 0)`;
  }

  function inizia() {
    btnPunto.textContent = "Fai la maglia";
    g = { maglie: [], punti: 0, vite: 3, riga: 0, fase: Math.random() * 6, velocita: 1.7, finita: false, serie: 0, perfette: 0 };
    schermo.hidden = true;
    sezione.classList.add("in-gioco");
    lavoro.classList.remove("festa");
    elVite.querySelectorAll("svg").forEach((s) => s.classList.remove("perso"));
    btnPunto.disabled = false;
    btnPunto.focus({ preventScroll: true });
    nuovaZona(); aggiorna(); disegna(); spostaUncinetto();
    elMsg.textContent = "Premi quando il segno è nella zona chiara.";
    let prima = performance.now();
    (function ciclo(t) {
      if (!g || g.finita) return;
      g.fase += ((t - prima) / 1000) * g.velocita; prima = t;
      g.pos = (Math.sin(g.fase) + 1) / 2;
      segno.style.transform = `translate3d(${g.pos * barra.clientWidth}px,0,0)`;
      requestAnimationFrame(ciclo);
    })(prima);
  }

  function fumetto(testo, i) {
    const p = pos(i), k = tela.clientWidth / W;
    const el = document.createElement("span");
    el.className = "gioco-fumetto";
    el.textContent = testo;
    el.style.left = `${(p.x + cella / 2) * k}px`;
    el.style.top = `${p.y * k}px`;
    lavoro.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function punto() {
    if (!g || g.finita) return;
    const d = Math.abs(g.pos - g.zona.centro), meta = g.zona.amp / 2;
    const i = g.maglie.length, colore = FILI[filo][CELLE[i].r % 2];
    let tipo;
    if (d <= meta * 0.4) { tipo = "perfetta"; g.serie++; g.perfette++; const p = 3 + Math.min(g.serie - 1, 3); g.punti += p; fumetto(`+${p}`, i); elMsg.textContent = g.serie > 2 ? `Perfetta! ${g.serie} di fila` : "Perfetta!"; }
    else if (d <= meta) { tipo = "buona"; g.serie = 0; g.punti += 1; fumetto("+1", i); elMsg.textContent = "Buona."; }
    else {
      tipo = "saltata"; g.serie = 0; g.vite--;
      elVite.querySelectorAll("svg")[g.vite]?.classList.add("perso");
      elMsg.textContent = "Maglia saltata!";
      barra.classList.remove("scossa"); void barra.offsetWidth; barra.classList.add("scossa");
    }
    g.maglie.push({ tipo, colore, t: performance.now() });
    uncinetto.classList.remove("affonda"); void uncinetto.offsetWidth; uncinetto.classList.add("affonda");
    const nuovaRiga = i + 1 < TOT && CELLE[i + 1].r !== CELLE[i].r;
    if (nuovaRiga) { g.riga++; g.velocita += 0.4; }
    aggiorna(); disegna();
    if (g.vite <= 0) return fine(false);
    if (g.maglie.length >= TOT) return fine(true);
    nuovaZona(); spostaUncinetto();
  }

  function coriandoli() {
    if (!moto) return;
    const colori = [...FILI[filo], "#efc12f", "#ffffff"];
    for (let i = 0; i < 22; i++) {
      const el = document.createElement("span");
      el.className = "gioco-coriandolo";
      el.style.setProperty("--c", colori[i % colori.length]);
      el.style.setProperty("--x", `${(Math.random() - 0.5) * 420}px`);
      el.style.setProperty("--y", `${-120 - Math.random() * 220}px`);
      el.style.setProperty("--r", `${(Math.random() - 0.5) * 540}deg`);
      el.style.animationDelay = `${Math.random() * 0.15}s`;
      lavoro.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  }

  function fine(vinto) {
    g.finita = true;
    btnPunto.disabled = true;
    sezione.classList.remove("in-gioco");
    btnPunto.blur();
    const nuovoRecord = g.punti > record;
    if (nuovoRecord) { record = g.punti; try { localStorage.setItem("atenir-record-cuore", String(record)); } catch {} }
    if (vinto) {
      const stelle = g.perfette >= TOT * 0.8 ? 3 : g.perfette >= TOT * 0.5 ? 2 : 1;
      titoloSchermo.textContent = `Cuoricino finito! ${"★".repeat(stelle)}${"☆".repeat(3 - stelle)}`;
      lavoro.classList.add("festa");
      coriandoli();
    } else {
      titoloSchermo.textContent = "Gomitoli finiti!";
    }
    elMsg.innerHTML = `<strong>${titoloSchermo.textContent}</strong> ${g.perfette} maglie perfette, ${g.punti} punti. ` + (nuovoRecord ? "Nuovo record!" : `Record: ${record}.`);
    // il risultato resta nel pannello, il cuore rimane tutto visibile
    setTimeout(() => {
      btnPunto.textContent = "Gioca ancora";
      btnPunto.disabled = false;
      g.rigioca = true;
    }, vinto ? 900 : 500);
  }

  function aggiorna() {
    elPunti.textContent = g.punti;
    elMaglie.textContent = `${g.maglie.length}/${TOT}`;
    elVite.setAttribute("aria-label", `${Math.max(g.vite, 0)} gomitoli rimasti`);
  }

  btnInizia.addEventListener("click", inizia);
  const premi = () => (g && g.rigioca ? inizia() : punto());
  btnPunto.addEventListener("pointerdown", (e) => { e.preventDefault(); premi(); });
  btnPunto.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); premi(); } });
  tela.addEventListener("pointerdown", () => punto());
  addEventListener("keydown", (e) => {
    if (e.code !== "Space" || !g || g.finita) return;
    e.preventDefault();
    if (!e.repeat) punto();
  });

  $("gioco-record").textContent = record ? `Il tuo record: ${record} punti` : "";
  anteprima();
})();
