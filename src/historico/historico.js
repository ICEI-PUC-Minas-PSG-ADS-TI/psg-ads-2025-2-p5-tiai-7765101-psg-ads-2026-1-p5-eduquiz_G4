import { auth }                from "../db/firebase.js";
import { onAuthStateChanged }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db }                  from "../db/firebase.js";
import {
  collection, getDocs, doc, getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getCatalogo, getRespostasDaLicao } from "../db/progresso.js";


let uid             = null;
let catalogo        = [];
let todasLicoes     = [];
let licoesFiltradas = [];
let filtroAtivo     = "all";
let buscaAtiva      = "";
let mfiltroAtivo    = "all";
let respostas       = [];


onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../login/login.html"; return; }
  uid = user.uid;

  document.getElementById("avatar").textContent    = user.email[0].toUpperCase();
  document.getElementById("userEmail").textContent = user.email;

  catalogo = await getCatalogo().catch(() => []);
  await carregarHistorico();


  const p = new URLSearchParams(window.location.search);
  const dlLicao   = p.get("licaoId");
  const dlMateria = p.get("materiaId");
  if (dlLicao && dlMateria) {
    const licao = todasLicoes.find(l => l.id === dlLicao && l.materiaId === dlMateria);
    if (licao) {
      abrirModalRevisao(licao);
    } else {
      // Busca direto no Firestore
      try {
        const snap = await getDoc(
          doc(db, "usuarios", uid, "materias", dlMateria, "licoes", dlLicao)
        );
        if (snap.exists()) {
          const mat = catalogo.find(m => m.id === dlMateria);
          abrirModalRevisao({
            id:           dlLicao,
            materiaId:    dlMateria,
            materiaNome:  mat?.nome   ?? dlMateria,
            materiaEmoji: mat?.emoji  ?? "📚",
            materiaCor:   mat?.cor    ?? "#5f7cff",
            ...snap.data(),
          });
        }
      } catch (e) { console.error("Deep-link falhou:", e); }
    }
  }
});

// Carregar todo o histórico do usuário
async function carregarHistorico() {
  try {
    todasLicoes = await buscarTodasLicoes(uid);
  } catch (e) {
    console.error("Erro ao carregar histórico:", e);
    todasLicoes = [];
  }

  document.getElementById("skeletons").classList.add("hidden");
  atualizarResumo();
  aplicarFiltros();
}


//Percorre TODAS as matérias do catálogo e tenta buscar lições do usuário.
//Usa o catálogo como fonte de IDs porque o documento pai no Firestore
 
async function buscarTodasLicoes(uid) {
  // Garante que temos o catálogo carregado
  const fonteIds = catalogo.length > 0
    ? catalogo.map(m => m.id)
    : await buscarIdsMateriasDoBD(uid);

  if (fonteIds.length === 0) return [];

  const todas = [];

  await Promise.all(
    fonteIds.map(async (materiaId) => {
      const mat = catalogo.find(m => m.id === materiaId);
      try {
        const licoesSnap = await getDocs(
          collection(db, "usuarios", uid, "materias", materiaId, "licoes")
        );
        licoesSnap.docs.forEach(d => {
          const data = d.data();
          if (!data.concluida) return;
          todas.push({
            id:           d.id,
            materiaId,
            materiaNome:  mat?.nome   ?? materiaId,
            materiaEmoji: mat?.emoji  ?? "📚",
            materiaCor:   mat?.cor    ?? "#5f7cff",
            ...data,
          });
        });
      } catch (_) {
        // matéria sem lições : ignora silenciosamente
      }
    })
  );

  return todas.sort((a, b) => {
    const ta = a.criadaEm?.toMillis?.() ?? (a.criadaEm?.seconds ?? 0) * 1000;
    const tb = b.criadaEm?.toMillis?.() ?? (b.criadaEm?.seconds ?? 0) * 1000;
    return tb - ta;
  });
}


//Fallback: tenta descobrir IDs de matérias lendo o doc de usuário ou
//usando uma lista padrão conhecida, quando o catálogo ainda não carregou.

async function buscarIdsMateriasDoBD(uid) {
  // Tenta ler o documento de usuário que pode ter materias salvas
  try {
    const userSnap = await getDocs(collection(db, "usuarios", uid, "materias"));
    if (!userSnap.empty) return userSnap.docs.map(d => d.id);
  } catch (_) {}
  // Última opção: IDs fixos das matérias padrão
  return [
    "portugues","matematica","ciencias","geografia",
    "historia","fisica","quimica","ingles","artes","ed_fisica","filosofia","sociologia"
  ];
}


function atualizarResumo() {
  const totalAcertos = todasLicoes.reduce((s, l) => s + (l.acertos ?? 0), 0);
  const totalQs      = todasLicoes.reduce((s, l) => s + (l.total   ?? 0), 0);
  const totalErros   = totalQs - totalAcertos;
  const pct          = totalQs > 0 ? Math.round((totalAcertos / totalQs) * 100) : 0;

  document.getElementById("sumLicoes").textContent  = todasLicoes.length;
  document.getElementById("sumAcertos").textContent = totalAcertos;
  document.getElementById("sumErros").textContent   = totalErros;
  document.getElementById("sumPct").textContent     = pct + "%";
}

// Filtros 
document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filtroAtivo = btn.dataset.filter;
    aplicarFiltros();
  });
});

document.getElementById("searchInput").addEventListener("input", e => {
  buscaAtiva = e.target.value.toLowerCase().trim();
  aplicarFiltros();
});

function getPct(l) {
  return l.total > 0 ? Math.round((l.acertos / l.total) * 100) : 0;
}

function aplicarFiltros() {
  licoesFiltradas = todasLicoes.filter(l => {
    const pct = getPct(l);
    if (filtroAtivo === "acerto" && pct < 70)  return false;
    if (filtroAtivo === "erro"   && pct >= 70) return false;
    if (buscaAtiva) {
      const hay = [l.materiaNome ?? "", l.topico ?? ""].join(" ").toLowerCase();
      if (!hay.includes(buscaAtiva)) return false;
    }
    return true;
  });
  renderLicoes();
}

// Render lista
function renderLicoes() {
  const list  = document.getElementById("licoesList");
  const empty = document.getElementById("emptyState");
  list.innerHTML = "";

  if (todasLicoes.length === 0) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  if (licoesFiltradas.length === 0) {
    list.innerHTML = `<div class="no-results">Nenhuma lição encontrada com esses filtros.</div>`;
    return;
  }

  licoesFiltradas.forEach((l, i) => list.appendChild(criarLicaoRow(l, i)));
}

function getScoreClass(pct) {
  return pct >= 70 ? "high" : pct >= 40 ? "medium" : "low";
}

function criarLicaoRow(l, delay = 0) {
  const pct    = getPct(l);
  const cls    = getScoreClass(pct);
  const tagCls = pct >= 70 ? "ok" : pct >= 40 ? "med" : "err";
  const tagTxt = pct >= 70 ? "✓ Bom resultado" : pct >= 40 ? "~ Regular" : "✗ Para revisar";

  const dataStr = l.criadaEm?.toDate
    ? l.criadaEm.toDate().toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" })
    : l.criadaEm?.seconds
      ? new Date(l.criadaEm.seconds * 1000).toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" })
      : "—";

  const row = document.createElement("div");
  row.className = "licao-row";
  row.style.animationDelay = `${delay * 40}ms`;

  row.innerHTML = `
    <div class="licao-score-circle ${cls}">${pct}%</div>
    <div class="licao-info">
      <div class="licao-info-top">
        <span class="licao-materia-badge" style="border-color:${l.materiaCor}40;color:${l.materiaCor}">
          ${l.materiaEmoji} ${l.materiaNome}
        </span>
        <span class="licao-topico">${l.topico ?? "—"}</span>
      </div>
      <div class="licao-meta">
        <span>${l.acertos ?? 0} acertos · ${(l.total ?? 0) - (l.acertos ?? 0)} erros · ${l.total ?? 0} questões</span>
      </div>
    </div>
    <div class="licao-right">
      <span class="licao-date">${dataStr}</span>
      <span class="licao-tag ${tagCls}">${tagTxt}</span>
    </div>
  `;

  row.addEventListener("click", () => abrirModalRevisao(l));
  return row;
}

// ─Modal de revisão 
async function abrirModalRevisao(l) {
  mfiltroAtivo = "all";
  respostas    = [];

  document.getElementById("modalEmoji").textContent  = l.materiaEmoji ?? "📚";
  document.getElementById("modalTitulo").textContent = `${l.materiaNome} · ${l.topico ?? "—"}`;

  const dataStr = l.criadaEm?.toDate
    ? l.criadaEm.toDate().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })
    : l.criadaEm?.seconds
      ? new Date(l.criadaEm.seconds * 1000).toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })
      : "—";
  document.getElementById("modalSub").textContent = dataStr;

  const pct   = getPct(l);
  const erros = (l.total ?? 0) - (l.acertos ?? 0);
  document.getElementById("msAcertos").textContent = l.acertos ?? 0;
  document.getElementById("msErros").textContent   = erros;
  document.getElementById("msPct").textContent     = pct + "%";

  document.querySelectorAll(".mf-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.mfilter === "all")
  );

  document.getElementById("modalRevisao").classList.remove("hidden");
  document.getElementById("modalLoading").classList.remove("hidden");
  document.getElementById("questoesList").innerHTML = "";

  try {
    respostas = await getRespostasDaLicao(uid, l.materiaId, l.id);
  } catch (e) {
    console.error("Erro ao buscar respostas:", e);
    respostas = [];
  }

  document.getElementById("modalLoading").classList.add("hidden");
  renderQuestoes();
}

document.getElementById("btnFecharModal").addEventListener("click", () =>
  document.getElementById("modalRevisao").classList.add("hidden")
);

document.getElementById("modalRevisao").addEventListener("click", e => {
  if (e.target === document.getElementById("modalRevisao"))
    document.getElementById("modalRevisao").classList.add("hidden");
});

document.querySelectorAll(".mf-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mf-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mfiltroAtivo = btn.dataset.mfilter;
    renderQuestoes();
  });
});

//Render questões no modal 
function renderQuestoes() {
  const list = document.getElementById("questoesList");
  list.innerHTML = "";

  if (respostas.length === 0) {
    list.innerHTML = `
      <div class="no-questoes">
        <p style="font-size:15px;font-weight:700;margin-bottom:8px">Sem respostas detalhadas</p>
        <p style="font-size:13px">Esta lição foi feita antes do sistema de revisão ser ativado.</p>
      </div>`;
    return;
  }

  const filtradas = respostas.filter(r => {
    if (mfiltroAtivo === "acerto") return r.acertou === true;
    if (mfiltroAtivo === "erro")   return r.acertou === false;
    return true;
  });

  if (filtradas.length === 0) {
    list.innerHTML = `<div class="no-questoes">Nenhuma questão com este filtro.</div>`;
    return;
  }

  const letras = ["A","B","C","D","E"];

  filtradas.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = `questao-card ${r.acertou ? "acertou" : "errou"}`;
    card.style.animationDelay = `${i * 30}ms`;

    const opcoesHtml = (r.opcoes ?? []).map((op, idx) => {
      const isCorreta = idx === r.correta;
      const isUsuario = idx === r.respostaUsuario;
      const isErrada  = isUsuario && !isCorreta;

      let cls  = isCorreta ? "opcao-correta" : isErrada ? "opcao-usuario-errada" : "";
      let hint = "";

      if (isCorreta && isUsuario) hint = `<span class="opcao-hint ok">✓ Sua resposta (correta)</span>`;
      else if (isCorreta)         hint = `<span class="opcao-hint ok">✓ Resposta correta</span>`;
      else if (isErrada)          hint = `<span class="opcao-hint err">✗ Sua resposta</span>`;

      return `
        <div class="opcao-item ${cls}">
          <span class="opcao-letra">${letras[idx]}</span>
          <span class="opcao-texto">${op.replace(/^[A-D]\)\s*/i,"")}${hint}</span>
        </div>`;
    }).join("");

    card.innerHTML = `
      <div class="questao-header">
        <div class="questao-status ${r.acertou ? "ok" : "err"}">
          <span class="status-icon ${r.acertou ? "ok" : "err"}">${r.acertou ? "✓" : "✗"}</span>
          ${r.acertou ? "Acertou" : "Errou"}
        </div>
        <div class="questao-badges">
          <span class="badge ${r.dificuldade ?? ""}">${r.dificuldade ?? "—"}</span>
          ${r.topico ? `<span class="badge">${r.topico}</span>` : ""}
        </div>
      </div>
      <p class="questao-pergunta">${r.pergunta ?? "—"}</p>
      <div class="opcoes-list">${opcoesHtml}</div>
      ${r.explicacao ? `
        <div class="explicacao-box">
          <strong>💡 Explicação</strong>
          ${r.explicacao}
        </div>` : ""}
    `;

    list.appendChild(card);
  });
}