// ===== Da completare: i tuoi contatti =====
// Scrivi qui il nome utente e il numero, il resto del sito si aggiorna da solo.
const CONTATTI = {
  instagram: "atenir",          // nome utente Instagram, senza @
  tiktok: "atenir",             // nome utente TikTok, senza @
  whatsapp: "390000000000",     // numero con prefisso, solo cifre (es. 393331234567)
  email: "ciao@atenir.it",
};
// ==========================================

const COLORI = [
  { nome: "Rosso papavero", valore: "#c0302f" },
  { nome: "Ruggine", valore: "#c67a48" },
  { nome: "Girasole", valore: "#fdbe58" },
  { nome: "Salvia", valore: "#5a994b" },
  { nome: "Cielo", valore: "#6e9ac9" },
  { nome: "Viola", valore: "#5e1ae8" },
  { nome: "Blu Atenir", valore: "#3a6df0" },
  { nome: "Panna", valore: "#fff6e6" },
];
const NOMI_PEZZI = { berretta: "Berretta", sciarpotto: "Sciarpotto", borsetta: "Borsetta" };

const link = {
  instagram: `https://instagram.com/${CONTATTI.instagram}`,
  instagramDm: `https://ig.me/m/${CONTATTI.instagram}`,
  tiktok: `https://www.tiktok.com/@${CONTATTI.tiktok}`,
  whatsapp: `https://wa.me/${CONTATTI.whatsapp}`,
  email: `mailto:${CONTATTI.email}`,
};

document.querySelectorAll("[data-link]").forEach((a) => {
  a.href = link[a.dataset.link];
  if (!a.href.startsWith("mailto:")) { a.target = "_blank"; a.rel = "noopener"; }
});
document.getElementById("anno").textContent = new Date().getFullYear();

// ----- Crea il tuo -----
const stato = { pezzo: "berretta", colore: COLORI[0] };
const anteprima = document.getElementById("anteprima");
const etichetta = document.getElementById("etichetta-anteprima");
const contenitoreColori = document.getElementById("colori");
const bottoniPezzo = document.querySelectorAll("[data-pezzo]");
const ordinaIg = document.getElementById("ordina-instagram");
const ordinaWa = document.getElementById("ordina-whatsapp");
const nota = document.getElementById("nota-copia");

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

bottoniPezzo.forEach((b) =>
  b.addEventListener("click", () => { stato.pezzo = b.dataset.pezzo; aggiorna(); })
);

document.querySelectorAll("[data-scegli]").forEach((a) =>
  a.addEventListener("click", () => { stato.pezzo = a.dataset.scegli; aggiorna(); })
);

function messaggio() {
  return `Ciao! Ho visto il sito di Atenir e vorrei una ${NOMI_PEZZI[stato.pezzo].toLowerCase()} color ${stato.colore.nome.toLowerCase()}. Mi dici prezzo e tempi?`
    .replace("una sciarpotto", "uno sciarpotto");
}

function aggiorna() {
  anteprima.querySelector("use").setAttribute("href", `#${stato.pezzo}`);
  anteprima.style.color = stato.colore.valore;
  anteprima.classList.remove("cambia");
  void anteprima.offsetWidth;
  anteprima.classList.add("cambia");
  etichetta.textContent = `${NOMI_PEZZI[stato.pezzo]} · ${stato.colore.nome}`;

  bottoniPezzo.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.pezzo === stato.pezzo)));
  contenitoreColori.querySelectorAll(".campione").forEach((b) =>
    b.setAttribute("aria-checked", String(b.getAttribute("aria-label") === stato.colore.nome))
  );

  ordinaWa.href = `${link.whatsapp}?text=${encodeURIComponent(messaggio())}`;
  ordinaIg.href = link.instagramDm;
  nota.textContent = "";
}

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

aggiorna();
anteprima.classList.remove("cambia");

// ----- Entrate in scena allo scroll -----
const daAnimare = document.querySelectorAll(
  ".hero-testo > *, section h2, .intro, .prodotto, .passi li, .chi-sono-testo p, .segui p, .segui-azioni"
);
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  daAnimare.forEach((el) => {
    el.classList.add("entra");
    const fratelli = [...el.parentElement.children];
    el.style.setProperty("--ritardo", `${Math.min(fratelli.indexOf(el), 4) * 0.08}s`);
  });
  const oss = new IntersectionObserver((voci) => {
    voci.forEach((v) => { if (v.isIntersecting) { v.target.classList.add("visibile"); oss.unobserve(v.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  daAnimare.forEach((el) => oss.observe(el));
}

// ===== Animazioni moderne =====
const moto = !matchMedia("(prefers-reduced-motion: reduce)").matches;
const puntatoreFine = matchMedia("(pointer: fine)").matches;

// Titoli divisi in parole che salgono una alla volta
document.querySelectorAll("h1, section h2").forEach((t) => {
  t.classList.remove("entra");
  t.innerHTML = t.textContent.trim().split(/\s+/)
    .map((p, i) => `<span class="parola"><span style="--i:${i}">${p}</span></span>`).join(" ");
  if (!moto || !("IntersectionObserver" in window)) { t.classList.add("titolo-visibile"); return; }
  new IntersectionObserver((v, o) => {
    if (v[0].isIntersecting) { t.classList.add("titolo-visibile"); o.disconnect(); }
  }, { rootMargin: "0px 0px -10% 0px" }).observe(t);
});

// Filo di lana: onda che si disegna con lo scroll, gomitolo che rotola
const filo = document.getElementById("filo-path");
const filoSvg = filo.ownerSVGElement;
const gomitolo = document.querySelector(".gomitolo");
let lunghezza = 0, larghezza = 0;
function disegnaFilo() {
  larghezza = filoSvg.clientWidth;
  filoSvg.setAttribute("viewBox", `0 0 ${larghezza} 24`);
  let d = "M0 12";
  for (let x = 0, i = 0; x < larghezza; x += 26, i++) d += ` Q${x + 13} ${i % 2 ? 20 : 4} ${x + 26} 12`;
  filo.setAttribute("d", d);
  lunghezza = filo.getTotalLength();
  filo.style.strokeDasharray = lunghezza;
}
disegnaFilo();

let ultimoY = scrollY, velocita = 0;
function suScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
  filo.style.strokeDashoffset = lunghezza * (1 - p);
  gomitolo.style.transform = `translateX(${p * larghezza}px) rotate(${p * 1440}deg) scale(${1 - p * 0.45})`;
  velocita = scrollY - ultimoY; ultimoY = scrollY;
}
addEventListener("scroll", suScroll, { passive: true });
addEventListener("resize", () => { disegnaFilo(); suScroll(); });
suScroll();

// Nastro: accelera e cambia verso seguendo lo scroll
const nastro = document.querySelector(".nastro-traccia");
if (moto && nastro.getAnimations) {
  let vel = 1;
  (function ciclo() {
    const anim = nastro.getAnimations()[0];
    const obiettivo = 1 + Math.min(Math.abs(velocita) / 6, 6) * Math.sign(velocita || 1);
    vel += (obiettivo - vel) * 0.08;
    if (anim) anim.playbackRate = vel;
    velocita *= 0.9;
    requestAnimationFrame(ciclo);
  })();
}

if (moto && puntatoreFine) {
  // Schede 3D
  document.querySelectorAll(".prodotto-figura").forEach((f) => {
    f.addEventListener("pointermove", (e) => {
      const r = f.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      f.style.transform = `perspective(700px) rotateX(${-y * 14}deg) rotateY(${x * 16}deg) scale(1.03)`;
      f.style.setProperty("--px", `${x * 18}px`);
      f.style.setProperty("--py", `${y * 18}px`);
    });
    f.addEventListener("pointerleave", () => {
      f.style.transform = ""; f.style.setProperty("--px", "0px"); f.style.setProperty("--py", "0px");
    });
  });

  // Bottoni magnetici
  document.querySelectorAll(".bottone").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = "0 0"; });
  });

  // Hero: i pezzi seguono il mouse a profondità diverse
  const hero = document.querySelector(".hero");
  const pezzi = [...document.querySelectorAll(".hero-pezzo, .hero .raggi, .hero .pennellata")];
  const profondita = [28, -22, 16, 40, -36, 8];
  hero.addEventListener("pointermove", (e) => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    pezzi.forEach((el, i) => { el.style.translate = `${x * profondita[i]}px ${y * profondita[i]}px`; });
  });
}

// Configuratore: schizzo di colore e sfondo tinto a ogni scelta
const schizzo = document.getElementById("schizzo");
const sezioneCrea = document.querySelector(".crea");
const aggiornaBase = aggiorna;
aggiorna = function () {
  aggiornaBase();
  sezioneCrea.style.setProperty("--colore-scelto", stato.colore.valore);
  if (moto && schizzo.animate) {
    schizzo.animate(
      [{ transform: "scale(.2)", opacity: .55 }, { transform: "scale(1.15)", opacity: 0 }],
      { duration: 700, easing: "cubic-bezier(.2,.8,.3,1)" }
    );
  }
};
sezioneCrea.style.setProperty("--colore-scelto", stato.colore.valore);
