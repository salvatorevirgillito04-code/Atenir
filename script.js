// ===== I tuoi contatti =====
// Lascia vuoto ("") quello che non vuoi mostrare: sparisce dal sito.
const CONTATTI = {
  instagram: "atenir_handmade", // nome utente Instagram, senza @
  tiktok: "",                   // nome utente TikTok, senza @
  whatsapp: "",                 // numero con prefisso, solo cifre, es. 393331234567
  email: "",                    // indirizzo email
};
// ===========================

const COLORI = [
  { nome: "Rosso papavero", valore: "#b8322f" },
  { nome: "Ruggine", valore: "#c4622f" },
  { nome: "Girasole", valore: "#efc12f" },
  { nome: "Salvia", valore: "#5f9a50" },
  { nome: "Cielo", valore: "#7ea3cf" },
  { nome: "Blu Atenir", valore: "#2f4f9e" },
  { nome: "Viola", valore: "#6a3be0" },
  { nome: "Rosa cipria", valore: "#e8a5a5" },
  { nome: "Panna", valore: "#ece4d6" },
  { nome: "Grigio melange", valore: "#a3a3a6" },
  { nome: "Antracite", valore: "#3b3b3d" },
];
const moto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const puntatoreFine = matchMedia("(pointer: fine)").matches;

const link = {
  instagram: `https://instagram.com/${CONTATTI.instagram}`,
  instagramDm: `https://ig.me/m/${CONTATTI.instagram}`,
  tiktok: `https://www.tiktok.com/@${CONTATTI.tiktok}`,
  whatsapp: `https://wa.me/${CONTATTI.whatsapp}`,
  email: `mailto:${CONTATTI.email}`,
};
document.querySelectorAll("[data-link]").forEach((a) => {
  if (!CONTATTI[a.dataset.link]) { a.remove(); return; }
  a.href = link[a.dataset.link];
  if (a.dataset.link !== "email") { a.target = "_blank"; a.rel = "noopener"; }
});
document.getElementById("anno").textContent = new Date().getFullYear();

// "Disegna la tua" porta all'editor con il pezzo giusto
document.querySelectorAll("[data-editor]").forEach((a) =>
  a.addEventListener("click", () => window.editorProdotto?.(a.dataset.editor))
);

// ----- Nastro -----
const parole = ["Berrette", "Sciarpotti", "Borse", "Fatto a mano", "Su ordinazione", "Colori a scelta"];
const puntini = ["#b8322f", "#c4622f", "#efc12f", "#5f9a50", "#7ea3cf", "#6a3be0"];
const gruppo = parole.map((p, i) => `<span>${p}</span><i style="--c:${puntini[i]}"></i>`).join("");
document.getElementById("nastro").innerHTML = `<div class="nastro-gruppo">${gruppo}</div><div class="nastro-gruppo">${gruppo}</div>`;

// ----- Foto ingrandite -----
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
document.querySelectorAll("[data-grande]").forEach((b) => b.addEventListener("click", () => {
  lightboxImg.src = b.dataset.grande;
  lightboxImg.alt = b.querySelector("img").alt;
  lightbox.showModal();
}));
document.getElementById("lightbox-chiudi").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });

// ----- Collezione: scorrimento orizzontale agganciato (da 961 px in su) -----
const collezione = document.getElementById("collezione");
const traccia = document.getElementById("traccia");
const largo = matchMedia("(min-width: 961px)");
// Filo di lana sotto la testata: si srotola con lo scroll, il gomitolo rotola e si consuma
const filo = document.getElementById("filo-path");
const filoOmbra = document.getElementById("filo-ombra");
const filoSvg = document.getElementById("filo-svg");
const gomitolo = document.getElementById("gomitolo");
let lunghezzaFilo = 0, larghezzaFilo = 0;
// Onda di archi da 22 px tra y=2 e y=12: la testata finisce esattamente sull'onda, senza bordo dritto
const PASSO = 22, MEZZO = 7, ALTEZZA_ONDA = 5;
const filoFondo = document.getElementById("filo-fondo");
function ondaY(x) {
  const i = Math.floor(x / PASSO), t = (x - i * PASSO) / PASSO;
  const controllo = MEZZO + (i % 2 ? ALTEZZA_ONDA : -ALTEZZA_ONDA) * 2;
  return MEZZO + 2 * t * (1 - t) * (controllo - MEZZO);
}
function disegnaFilo() {
  larghezzaFilo = filoSvg.clientWidth;
  filoSvg.setAttribute("viewBox", `0 0 ${larghezzaFilo} 16`);
  let onda = "";
  for (let x = 0, i = 0; x < larghezzaFilo + PASSO; x += PASSO, i++) {
    onda += ` Q${x + PASSO / 2} ${MEZZO + (i % 2 ? ALTEZZA_ONDA : -ALTEZZA_ONDA) * 2} ${x + PASSO} ${MEZZO}`;
  }
  filo.setAttribute("d", `M0 ${MEZZO}${onda}`);
  filoOmbra.setAttribute("d", `M0 ${MEZZO}${onda}`);
  filoFondo.setAttribute("d", `M0 -1 L0 ${MEZZO}${onda} L${larghezzaFilo + PASSO * 2} -1 Z`);
  lunghezzaFilo = filo.getTotalLength();
  filo.style.strokeDasharray = `${lunghezzaFilo}`;
}
let distanza = 0, inizioCollezione = 0;

// Le misure si prendono solo quando cambia l'impaginazione, mai durante lo scroll
function impagina() {
  if (largo.matches) {
    traccia.style.transform = "translate3d(0,0,0)";
    distanza = Math.max(0, traccia.scrollWidth - innerWidth);
    collezione.style.height = `${distanza + innerHeight}px`;
  } else {
    distanza = 0;
    collezione.style.height = "";
    traccia.style.transform = "";
  }
  disegnaFilo();
  inizioCollezione = collezione.offsetTop;
  disegnaScroll();
}

let inAttesa = false;
function suScroll() {
  if (inAttesa) return;
  inAttesa = true;
  requestAnimationFrame(() => { inAttesa = false; disegnaScroll(); });
}
function disegnaScroll() {
  const y = scrollY;
  // fondo pagina misurato ogni volta: sul telefono la barra del browser cambia l'altezza dello schermo
  const fondo = document.documentElement.scrollHeight - (window.visualViewport ? visualViewport.height : innerHeight);
  const avanz = fondo > 2 ? (y >= fondo - 2 ? 1 : Math.min(Math.max(y / fondo, 0), 1)) : 0;
  // il gomitolo si rimpicciolisce mentre il filo si consuma; il suo bordo tocca esattamente i due lati dello schermo
  const scala = 1 - avanz * 0.3, meta = 13.6 * scala; // 13.6 px = raggio della pallina disegnata (17/40 di 32 px)
  const x = meta + avanz * (larghezzaFilo - 2 * meta);
  const fineFilo = Math.ceil((larghezzaFilo + PASSO) / PASSO) * PASSO;
  filo.style.strokeDashoffset = avanz === 1 ? "0" : (lunghezzaFilo * (1 - x / fineFilo)).toFixed(1);
  gomitolo.style.transform = `translate3d(${x.toFixed(1)}px,${(ondaY(x) - 16).toFixed(1)}px,0) rotate(${(x / 16 * 57.3).toFixed(1)}deg) scale(${scala.toFixed(3)})`;
  if (!distanza) return;
  const p = Math.min(Math.max((y - inizioCollezione) / distanza, 0), 1);
  const dx = -p * distanza;
  traccia.style.transform = `translate3d(${dx.toFixed(1)}px,0,0)`;
}
addEventListener("scroll", suScroll, { passive: true });
window.visualViewport?.addEventListener("resize", suScroll);
addEventListener("resize", impagina);
largo.addEventListener("change", impagina);
addEventListener("load", impagina);
document.fonts?.ready.then(impagina);
impagina();

// ----- Ingressi -----
if (moto && "IntersectionObserver" in window) {
  const osserva = (el, classe, margine = "-10%") => {
    const o = new IntersectionObserver((v) => {
      if (v[0].isIntersecting) { el.classList.add(classe); o.disconnect(); }
    }, { rootMargin: `0px 0px ${margine} 0px` });
    o.observe(el);
  };
  // titoli: le parole salgono una alla volta
  document.querySelectorAll("h1, section h2").forEach((t) => {
    t.innerHTML = t.textContent.trim().split(/\s+/)
      .map((p, i) => `<span class="parola"><span style="--i:${i}">${p}</span></span>`).join(" ");
    osserva(t, "titolo-visibile");
  });
  // blocchi di testo in sequenza
  document.querySelectorAll(".hero-sotto, .hero-azioni, .intro, .passo, .chi-sono-corpo > *, .segui p, .segui-handle, .editor-comandi > *")
    .forEach((el) => {
      el.classList.add("entra");
      const fratelli = [...el.parentElement.children];
      el.style.setProperty("--ritardo", `${Math.min(fratelli.indexOf(el), 5) * 0.08}s`);
      osserva(el, "visibile");
    });
  // foto e tele: si aprono come una tenda
  document.querySelectorAll(".editor-anteprima").forEach((el, i) => {
    el.classList.add("rivela");
    el.style.setProperty("--ritardo", `${(i % 3) * 0.12}s`);
    osserva(el, "visibile", "0%");
  });

  // nastro: accelera e cambia verso seguendo lo scroll
  const nastro = document.getElementById("nastro");
  const animNastro = nastro.getAnimations?.()[0];
  let ultimoY = scrollY, velocita = 0, vel = 1, attivo = false;
  function ciclo() {
    const obiettivo = 1 + Math.min(Math.abs(velocita) / 8, 5) * Math.sign(velocita || 1);
    vel += (obiettivo - vel) * 0.08;
    velocita *= 0.88;
    if (animNastro) animNastro.playbackRate = vel;
    if (Math.abs(vel - 1) < 0.01 && Math.abs(velocita) < 0.1) { vel = 1; if (animNastro) animNastro.playbackRate = 1; attivo = false; return; }
    requestAnimationFrame(ciclo);
  }
  addEventListener("scroll", () => {
    velocita = scrollY - ultimoY; ultimoY = scrollY;
    if (!attivo && animNastro) { attivo = true; requestAnimationFrame(ciclo); }
  }, { passive: true });
}

// ----- Foto: la cucitura che scopre il prodotto -----
// porta un colore qualsiasi al colore più vicino della palette di Atenir
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
const rgbDi = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function piuVicino(rgb) {
  const [h, s, l] = hsl(rgb);
  const neutri = ["Panna", "Grigio melange", "Antracite"];
  const candidati = COLORI.filter((c) => (s < 0.12) === neutri.includes(c.nome));
  let meglio = candidati[0], dist = Infinity;
  for (const c of candidati) {
    const [h2, s2, l2] = hsl(rgbDi(c.valore));
    const dh = Math.min(Math.abs(h - h2), 360 - Math.abs(h - h2)) / 180;
    const d = s < 0.12 ? Math.abs(l - l2) : dh * 2 + Math.abs(l - l2) * 0.6 + Math.abs(s - s2) * 0.3;
    if (d < dist) { dist = d; meglio = c; }
  }
  return meglio.valore;
}

function colorePrincipale(img) {
  // la tinta che compare di più tra i pixel vivaci (12 spicchi di colore); se la foto è quasi grigia, un neutro
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, 0, 0, 32, 32);
    const d = x.getImageData(0, 0, 32, 32).data;
    const spicchi = Array.from({ length: 12 }, () => ({ peso: 0, r: 0, g: 0, b: 0 }));
    let vivaci = 0, totale = 0, lum = 0;
    for (let i = 0; i < d.length; i += 4) {
      const px = [d[i], d[i + 1], d[i + 2]], [h, s, l] = hsl(px);
      totale++; lum += l;
      if (s < 0.3 || l < 0.12 || l > 0.9) continue;
      vivaci++;
      const sp = spicchi[Math.floor(h / 30) % 12], p = s;
      sp.peso += p; sp.r += px[0] * p; sp.g += px[1] * p; sp.b += px[2] * p;
    }
    if (vivaci < totale * 0.1) return piuVicino([lum / totale * 255, lum / totale * 255, lum / totale * 255]);
    const top = spicchi.reduce((a, b) => (b.peso > a.peso ? b : a));
    return piuVicino([top.r / top.peso, top.g / top.peso, top.b / top.peso]);
  } catch { return "#c9c5bc"; }
}

// Un filo nel colore del prodotto cuce a punto filza il contorno della foto, guidato da un ago.
// Mentre cuce, la foto si scopre a partire dall'angolo dove inizia il filo. La foto non si muove mai.
const NS = "http://www.w3.org/2000/svg";
let numeroCucitura = 0;
function rettangoloArrotondato(w, h, m, r) {
  // parte dall'angolo in alto a sinistra e gira in senso orario
  const x0 = m, y0 = m, x1 = w - m, y1 = h - m;
  return `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}` +
    `H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
}

function preparaCucitura(cornice) {
  const img = cornice.querySelector("img");
  const scelto = COLORI.find((c) => c.nome === img.dataset.filato);
  const colore = scelto ? scelto.valore : null;
  img.style.clipPath = "polygon(0 0,0 0,0 0)";
  return { cornice, img, colore };
}

function cuci(t) {
  const { cornice, img } = t;
  const w = cornice.clientWidth, h = cornice.clientHeight;
  const colore = t.colore || colorePrincipale(img);
  const id = `cucitura-${++numeroCucitura}`;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "cucitura");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("aria-hidden", "true");
  const d = rettangoloArrotondato(w, h, 10, 12);
  svg.innerHTML = `
    <defs><mask id="${id}" maskUnits="userSpaceOnUse"><path d="${d}" fill="none" stroke="#fff" stroke-width="10"/></mask></defs>
    <path class="cucitura-alone" d="${d}" mask="url(#${id})"/>
    <path class="cucitura-filo" d="${d}" stroke="${colore}" mask="url(#${id})"/>
    <circle class="cucitura-ago" r="4.5" fill="${colore}"/>`;
  cornice.appendChild(svg);
  const guida = svg.querySelector("mask path"), ago = svg.querySelector("circle");
  const L = guida.getTotalLength();
  guida.style.strokeDasharray = `${L}`;
  // la foto si scopre a ventaglio dal centro, seguendo l'ago: compare solo dove il filo è già passato
  const cx = w / 2, cy = h / 2, R = Math.hypot(w, h);
  const p0 = guida.getPointAtLength(0), a0 = Math.atan2(p0.y - cy, p0.x - cx);
  const ventaglio = (fino) => {
    const punti = [`${cx}px ${cy}px`];
    for (let a = 0; a < fino; a += 0.12) punti.push(`${(cx + R * Math.cos(a0 + a)).toFixed(1)}px ${(cy + R * Math.sin(a0 + a)).toFixed(1)}px`);
    punti.push(`${(cx + R * Math.cos(a0 + fino)).toFixed(1)}px ${(cy + R * Math.sin(a0 + fino)).toFixed(1)}px`);
    return `polygon(${punti.join(",")})`;
  };
  const durata = 650, inizio = performance.now();
  const passo = (ora) => {
    const k = Math.min((ora - inizio) / durata, 1);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    guida.style.strokeDashoffset = `${L * (1 - e)}`;
    const p = guida.getPointAtLength(L * e);
    ago.setAttribute("cx", p.x.toFixed(1)); ago.setAttribute("cy", p.y.toFixed(1));
    const giro = e >= 0.999 ? Math.PI * 2 : (Math.atan2(p.y - cy, p.x - cx) - a0 + Math.PI * 4) % (Math.PI * 2);
    img.style.clipPath = e < 0.01 ? "polygon(0 0,0 0,0 0)" : ventaglio(giro);
    if (k < 1) return requestAnimationFrame(passo);
    img.style.clipPath = "";
    svg.classList.add("finita");
    setTimeout(() => svg.remove(), 450);
  };
  requestAnimationFrame(passo);
}

if (moto && "IntersectionObserver" in window) {
  const cuciture = new Map();
  const osservaFoto = new IntersectionObserver((voci) => {
    voci.forEach((v) => {
      if (!v.isIntersecting) return;
      const t = cuciture.get(v.target);
      osservaFoto.unobserve(v.target);
      const pronta = t.img.complete && t.img.naturalWidth ? Promise.resolve() : (t.img.decode ? t.img.decode().catch(() => {}) : Promise.resolve());
      Promise.race([pronta, new Promise((r) => setTimeout(r, 500))]).then(() => cuci(t));
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".categoria .foto").forEach((cornice) => {
    cuciture.set(cornice, preparaCucitura(cornice));
    osservaFoto.observe(cornice);
  });
}

// ----- Puntatore: cerchio che segue il mouse e bottoni magnetici -----
if (moto && puntatoreFine) {
  const cur = document.getElementById("cursore");
  const curTesto = document.getElementById("cursore-testo");
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    cur.classList.add("attivo");
    const t = e.target.closest?.("[data-cursore]");
    cur.classList.toggle("grande", !!t);
    curTesto.textContent = t ? t.dataset.cursore : "";
    cur.classList.toggle("su-link", !t && !!e.target.closest?.("a, button"));
  });
  document.addEventListener("pointerleave", () => cur.classList.remove("attivo"));
  let segue = false;
  function segui() {
    cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
    cur.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) requestAnimationFrame(segui); else segue = false;
  }
  addEventListener("pointermove", () => { if (!segue) { segue = true; requestAnimationFrame(segui); } }, { passive: true });

  document.querySelectorAll(".bottone").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.2}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = "0 0"; });
  });
}
