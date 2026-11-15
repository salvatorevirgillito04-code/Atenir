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
let distanza = 0;
function impagina() {
  if (largo.matches) {
    distanza = Math.max(0, traccia.scrollWidth - innerWidth);
    collezione.style.height = `${distanza + innerHeight}px`;
  } else {
    distanza = 0;
    collezione.style.height = "";
    traccia.style.transform = "";
  }
  suScroll();
}

// ----- Scroll: barra, orizzontale, parallasse -----
const barra = document.getElementById("progresso");
const collage = [...document.querySelectorAll("[data-velocita]")];
const fotoCollezione = [...document.querySelectorAll(".categoria .foto img")];
function suScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;

  if (distanza) {
    const p = Math.min(Math.max((scrollY - collezione.offsetTop) / distanza, 0), 1);
    traccia.style.transform = `translate3d(${-p * distanza}px,0,0)`;
  }
  if (!moto) return;
  collage.forEach((el) => { el.style.translate = `0 ${scrollY * +el.dataset.velocita}px`; });
  if (distanza) {
    fotoCollezione.forEach((img) => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.right < 0 || r.left > innerWidth) return;
      img.style.translate = `${(r.left + r.width / 2 - innerWidth / 2) * -0.07}px 0`;
    });
  }
}
addEventListener("scroll", suScroll, { passive: true });
addEventListener("resize", impagina);
largo.addEventListener("change", impagina);
addEventListener("load", impagina);
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
  document.querySelectorAll(".hero-sotto, .hero-azioni, .intro, .passo, .chi-sono-corpo > *, .segui p, .segui-handle, .editor-comandi > *, .gioco-pannello")
    .forEach((el) => {
      el.classList.add("entra");
      const fratelli = [...el.parentElement.children];
      el.style.setProperty("--ritardo", `${Math.min(fratelli.indexOf(el), 5) * 0.08}s`);
      osserva(el, "visibile");
    });
  // foto e tele: si aprono come una tenda
  document.querySelectorAll(".collage-foto, .categoria-foto .foto, .editor-anteprima, .gioco-lavoro").forEach((el, i) => {
    el.classList.add("rivela");
    el.style.setProperty("--ritardo", `${(i % 3) * 0.12}s`);
    osserva(el, "visibile", "0%");
  });

  // nastro: accelera e cambia verso seguendo lo scroll
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
  (function segui() {
    cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
    cur.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(segui);
  })();

  document.querySelectorAll(".bottone").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.2}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = "0 0"; });
  });
}
