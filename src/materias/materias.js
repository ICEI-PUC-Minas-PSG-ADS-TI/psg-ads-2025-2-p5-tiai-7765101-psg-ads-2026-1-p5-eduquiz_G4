import { auth }      from "../db/firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getCatalogo }           from "../db/progresso.js";
import { getProgressoMateria }   from "../db/progresso.js";
import { initPerfil }            from "../utils/perfil.js";

let uid = null;


onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../login/login.html"; return; }
  uid = user.uid;
  await initPerfil(user); // Carrega avatar, streak, badges e inicializa o modal
  
  renderSkeletons();
  await renderCards();
});

document.getElementById("btnLogout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../login/login.html";
});

//Filtro 
let filtroAtual = "todos";

document.getElementById("filters").addEventListener("click", e => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  filtroAtual = btn.dataset.nivel;
  document.querySelectorAll(".card[data-nivel]").forEach(card => {
    card.classList.toggle("hidden", filtroAtual !== "todos" && card.dataset.nivel !== filtroAtual);
  });
});


function renderSkeletons() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("div");
    s.className = "skeleton";
    grid.appendChild(s);
  }
}

// Cards
async function renderCards() {
  // Puxa catálogo e progresso do Firebase em paralelo
  const catalogo = await getCatalogo();

  const progressos = await Promise.all(
    catalogo.map(m =>
      getProgressoMateria(uid, m.id).catch(() => ({ porcentagem: 0, licoesFeitas: 0, totalLicoes: 0 }))
    )
  );

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  catalogo.forEach((m, i) => {
    const prog = progressos[i];
    const card = criarCard(m, prog);
    grid.appendChild(card);
  });

  // Se não há matérias no catálogo ainda
  if (catalogo.length === 0) {
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px">
      Nenhuma matéria cadastrada ainda. Adicione matérias na coleção <strong>config/materias</strong> do Firestore.
    </p>`;
  }
}

function criarCard(m, prog) {
  const pct   = prog.porcentagem;
  const label = prog.totalLicoes > 0
    ? `${prog.licoesFeitas}/${prog.totalLicoes} lições`
    : "Nenhuma lição ainda";

  const card = document.createElement("div");
  card.className        = "card";
  card.dataset.nivel    = m.nivelFiltro ?? "fund2";
  card.style.setProperty("--card-color", m.cor);

  card.innerHTML = `
    <div class="card-head">
      <div class="card-icon">${m.emoji}</div>
      <span class="card-badge">${m.nivel ?? m.escolaridade ?? ""}</span>
    </div>
    <div class="card-body">
      <h3>${m.nome}</h3>
      <p class="card-meta">${m.escolaridade ?? ""} · ${m.nivel ?? ""}</p>
      <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
      <div class="prog-info">
        <span class="prog-pct">${pct}%</span>
        <span class="prog-lies">${label}</span>
      </div>
    </div>
  `;

  card.addEventListener("click", () => {
    const p = new URLSearchParams({
      id:    m.id,
      nome:  m.nome,
      emoji: m.emoji,
      cor:   m.cor,
      nivel: m.nivel ?? "",
      escolaridade: m.escolaridade ?? "",
    });
    window.location.href = `../licao/licao.html?${p}`;
  });

  return card;
}