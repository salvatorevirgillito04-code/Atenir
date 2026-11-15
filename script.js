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
