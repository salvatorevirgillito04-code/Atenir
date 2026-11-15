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
  { nome: "Ruggine", valore: "#c47a4a" },
  { nome: "Girasole", valore: "#e9ae45" },
  { nome: "Salvia", valore: "#5f9a50" },
  { nome: "Cielo", valore: "#7ea3cf" },
  { nome: "Viola", valore: "#6a3be0" },
  { nome: "Blu Atenir", valore: "#3a6df0" },
  { nome: "Panna", valore: "#ece4d6" },
  { nome: "Grigio melange", valore: "#9a9894" },
  { nome: "Antracite", valore: "#3b3b3d" },
];
const NOMI_PEZZI = { berretta: "Berretta", sciarpotto: "Sciarpotto", borsetta: "Borsetta" };
const moto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const puntatoreFine = matchMedia("(pointer: fine)").matches;

// ----- Contatti -----
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

// ----- Trame di maglia -----
const maglie = new Map();
document.querySelectorAll("canvas.maglia").forEach((c) => maglie.set(c, new Maglia(c)));
maglie.forEach((m) => m.disegna());

// Foto vere: se esiste assets/foto/<pezzo>.jpg prende il posto del disegno
document.querySelectorAll("[data-foto]").forEach((fig) => {
  const img = new Image();
  img.onload = () => {
    img.alt = fig.querySelector("canvas").getAttribute("aria-label") || "";
    fig.replaceChildren(img);
  };
  img.src = fig.dataset.foto;
});

// La maglia si forma riga dopo riga quando entra in vista
if ("IntersectionObserver" in window) {
  const oss = new IntersectionObserver((voci) => {
    voci.forEach((v) => {
      if (!v.isIntersecting) return;
      const m = maglie.get(v.target);
      if (m && !m.lavorata) { m.lavorata = true; m.lavora(v.target.id === "maglia-hero" ? 1800 : 1300); }
      oss.unobserve(v.target);
    });
  }, { threshold: 0.25 });
  maglie.forEach((m, c) => { if (moto) { m.ctx.clearRect(0, 0, c.width, c.height); oss.observe(c); } });
}

// Hero: il telo cambia colore da solo, ogni pochi secondi
const hero = maglie.get(document.getElementById("maglia-hero"));
const nomeHero = document.getElementById("hero-nome-colore");
const giroHero = ["Blu Atenir", "Rosso papavero", "Girasole", "Salvia", "Antracite", "Viola", "Ruggine", "Cielo"]
  .map((n) => COLORI.find((c) => c.nome === n));
let indiceHero = 0, heroVisibile = true;
new IntersectionObserver((v) => { heroVisibile = v[0].isIntersecting; }).observe(hero.canvas);
if (moto) {
  setInterval(() => {
    if (!heroVisibile || document.hidden) return;
    indiceHero = (indiceHero + 1) % giroHero.length;
    const c = giroHero[indiceHero];
    hero.imposta({ colore: c.valore, durata: 1300 });
    nomeHero.textContent = c.nome;
  }, 4200);
}

// ----- Nastro -----
const parole = ["Berrette", "Sciarpotti", "Borsette", "Fatto a mano", "Su ordinazione", "Colori a scelta"];
const puntini = ["#b8322f", "#c47a4a", "#e9ae45", "#5f9a50", "#7ea3cf", "#6a3be0"];
const gruppo = parole.map((p, i) => `<span>${p}</span><i style="--c:${puntini[i]}"></i>`).join("");
document.getElementById("nastro").innerHTML = `<div class="nastro-gruppo">${gruppo}</div><div class="nastro-gruppo">${gruppo}</div>`;

// ----- Configuratore -----
const stato = { pezzo: "berretta", colore: COLORI[0] };
const anteprima = maglie.get(document.getElementById("maglia-crea"));
const etichetta = document.getElementById("etichetta-anteprima");
const nomeColore = document.getElementById("nome-colore");
const contenitoreColori = document.getElementById("colori");
const segmenti = document.querySelector(".segmenti");
const bottoniPezzo = segmenti.querySelectorAll("[data-pezzo]");
const ordinaIg = document.getElementById("ordina-instagram");
const ordinaWa = document.getElementById("ordina-whatsapp");
const nota = document.getElementById("nota-copia");

const cursore = document.createElement("span");
cursore.className = "cursore";
segmenti.prepend(cursore);

COLORI.forEach((c, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "campione";
  b.setAttribute("role", "radio");
  b.setAttribute("aria-checked", i === 0 ? "true" : "false");
  b.setAttribute("aria-label", c.nome);
  b.title = c.nome;
  b.style.setProperty("--c", c.valore);
  b.addEventListener("click", () => { stato.colore = c; aggiorna(); });
  contenitoreColori.appendChild(b);
});
bottoniPezzo.forEach((b) => b.addEventListener("click", () => { stato.pezzo = b.dataset.pezzo; aggiorna(); }));
document.querySelectorAll("[data-scegli]").forEach((a) =>
  a.addEventListener("click", () => { stato.pezzo = a.dataset.scegli; aggiorna(); })
);

function messaggio() {
  const pezzo = stato.pezzo === "sciarpotto" ? "uno sciarpotto" : `una ${stato.pezzo}`;
  return `Ciao! Ho visto il sito di Atenir e vorrei ${pezzo} color ${stato.colore.nome.toLowerCase()}. Mi dici prezzo e tempi?`;
}

function muoviCursore() {
  const attivo = segmenti.querySelector('[aria-checked="true"]');
  cursore.style.width = `${attivo.offsetWidth}px`;
  cursore.style.transform = `translateX(${attivo.offsetLeft}px)`;
}

function aggiorna(prima = false) {
  if (!prima) anteprima.imposta({ colore: stato.colore.valore, forma: stato.pezzo, durata: 800 });
  etichetta.textContent = `${NOMI_PEZZI[stato.pezzo]}, ${stato.colore.nome}`;
  nomeColore.textContent = stato.colore.nome;
  bottoniPezzo.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.pezzo === stato.pezzo)));
  contenitoreColori.querySelectorAll(".campione").forEach((b) =>
    b.setAttribute("aria-checked", String(b.getAttribute("aria-label") === stato.colore.nome))
  );
  muoviCursore();
  if (CONTATTI.whatsapp) ordinaWa.href = `${link.whatsapp}?text=${encodeURIComponent(messaggio())}`;
  ordinaIg.href = link.instagramDm;
  nota.textContent = "";
}
addEventListener("resize", muoviCursore);
document.fonts?.ready.then(muoviCursore);

if (!CONTATTI.whatsapp) ordinaWa.remove();
[ordinaIg, ordinaWa].forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });

// Instagram non permette di precompilare il messaggio: lo copiamo negli appunti.
ordinaIg.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(messaggio());
    nota.textContent = "Messaggio copiato: incollalo nella chat di Instagram.";
  } catch {
    nota.textContent = `Scrivimi: "${messaggio()}"`;
  }
});
aggiorna(true);

// ----- Barra di avanzamento -----
const barra = document.getElementById("progresso");
function suScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener("scroll", suScroll, { passive: true });
suScroll();

// ----- Ingressi -----
if (moto && "IntersectionObserver" in window) {
  const osserva = (el, classe) => {
    const o = new IntersectionObserver((v) => {
      if (v[0].isIntersecting) { el.classList.add(classe); o.disconnect(); }
    }, { rootMargin: "0px 0px -10% 0px" });
    o.observe(el);
  };

  // titoli: le parole salgono una alla volta
  document.querySelectorAll("h1, section h2").forEach((t) => {
    t.innerHTML = t.textContent.trim().split(/\s+/)
      .map((p, i) => `<span class="parola"><span style="--i:${i}">${p}</span></span>`).join(" ");
    osserva(t, "titolo-visibile");
  });

  // testi e blocchi: salgono in sequenza
  document.querySelectorAll(".hero-sotto, .hero-azioni, .intro, .prodotto-testo, .passo, .chi-sono-corpo > *, .segui p, .segui-handle, .crea-testo .scelta, .crea-azioni")
    .forEach((el) => {
      el.classList.add("entra");
      const fratelli = [...el.parentElement.children];
      el.style.setProperty("--ritardo", `${Math.min(fratelli.indexOf(el), 4) * 0.09}s`);
      osserva(el, "visibile");
    });

  // immagini: si aprono dal basso come una tenda
  document.querySelectorAll(".prodotto-figura, .hero-figura .maglia").forEach((el, i) => {
    el.classList.add("rivela");
    el.style.setProperty("--ritardo", `${(i % 3) * 0.12}s`);
    osserva(el, "visibile");
  });

  // Nastro: accelera seguendo la velocità dello scroll
  const nastro = document.getElementById("nastro");
  let ultimoY = scrollY, velocita = 0, vel = 1;
  addEventListener("scroll", () => { velocita = scrollY - ultimoY; ultimoY = scrollY; }, { passive: true });
  (function ciclo() {
    const anim = nastro.getAnimations?.()[0];
    const obiettivo = 1 + Math.min(Math.abs(velocita) / 8, 5) * Math.sign(velocita || 1);
    vel += (obiettivo - vel) * 0.06;
    if (anim) anim.playbackRate = vel;
    velocita *= 0.9;
    requestAnimationFrame(ciclo);
  })();
}

if (moto && puntatoreFine) {
  // Bottoni magnetici
  document.querySelectorAll(".bottone").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.2}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = "0 0"; });
  });

  // Hero: il telo si inclina appena seguendo il mouse
  const figura = document.querySelector(".hero-figura");
  document.querySelector(".hero").addEventListener("pointermove", (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    figura.style.transform = `perspective(1400px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
  });
  figura.style.transition = "transform .8s cubic-bezier(.22,1,.36,1)";
}
