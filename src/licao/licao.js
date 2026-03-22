import { auth } from "../db/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { gerarTopicos, setOnStatus } from "../db/gemini.js";
import {
  getTopicos, salvarTopicos,
  getLicoes, criarLicao,
  getProgressoMateria, getMateria,
} from "../db/progresso.js";


const params       = new URLSearchParams(window.location.search);
const MAT_ID       = params.get("id")           || "portugues";
const MAT_NOME     = params.get("nome")         || "Matéria";
const MAT_EMOJI    = params.get("emoji")        || "📚";
const MAT_COR      = params.get("cor")          || "#5f7cff";
const MAT_NIVEL    = params.get("nivel")        || "6º Ano";
const ESCOLARIDADE = params.get("escolaridade") || "";

let uid              = null;
let topicoSelecionado = null;
let qtdSelecionada    = 5;


onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../login/login.html"; return; }
  uid = user.uid;
  initUI();
  await Promise.all([carregarTopicos(), carregarHistorico(), carregarProgresso()]);
});

function initUI() {
  document.documentElement.style.setProperty("--accent", MAT_COR);
  document.getElementById("pillEmoji").textContent  = MAT_EMOJI;
  document.getElementById("pillNome").textContent   = MAT_NOME;
  document.getElementById("heroIcon").textContent   = MAT_EMOJI;
  document.getElementById("heroNome").textContent   = MAT_NOME;
  document.getElementById("heroNivel").textContent  =
    ESCOLARIDADE ? `${ESCOLARIDADE} · ${MAT_NIVEL}` : MAT_NIVEL;
  document.title = `EduQuiz – ${MAT_NOME}`;

  setOnStatus(msg => {
    // status só aparece no quiz, não na licao
    console.log("[Gemini status]", msg);
  });
}

async function carregarTopicos() {
  const grid = document.getElementById("topicosGrid");
  grid.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const s = document.createElement("div"); s.className = "topico-skeleton"; grid.appendChild(s);
  }

  //  Tenta pegar do catálogo do Firebase (campo topicos na matéria)
  let topicos = await getTopicos(uid, MAT_ID);

  // Se não tem, pede à IA e salva no cache do usuário
  if (!topicos || topicos.length === 0) {
    try {
      topicos = await gerarTopicos(MAT_NOME, MAT_NIVEL);
      await salvarTopicos(uid, MAT_ID, topicos);
    } catch (e) {
      console.error("Erro ao gerar tópicos:", e);
      topicos = ["Geral"];
    }
  }

  if (!topicos.includes("Geral")) topicos.push("Geral");

  grid.innerHTML = "";
  topicos.forEach(t => {
    const btn = document.createElement("button");
    btn.className = "topico-btn";
    btn.innerHTML = `<span class="plus">+</span> ${t}`;
    btn.addEventListener("click", () => abrirModal(t));
    grid.appendChild(btn);
  });
}

//Progresso
async function carregarProgresso() {
  const prog = await getProgressoMateria(uid, MAT_ID)
    .catch(() => ({ porcentagem: 0, licoesFeitas: 0 }));
  document.getElementById("statPct").textContent    = prog.porcentagem + "%";
  document.getElementById("statLicoes").textContent = prog.licoesFeitas;
}

// Histórico
async function carregarHistorico() {
  const licoes = await getLicoes(uid, MAT_ID).catch(() => []);
  const empty  = document.getElementById("emptyState");
  const listEl = document.getElementById("historicoList");
  const btnVerTudo = document.getElementById("btnVerHistorico");
  listEl.innerHTML = "";

  if (!licoes.length) {
    empty.style.display  = "block";
    listEl.style.display = "none";
    if (btnVerTudo) btnVerTudo.style.display = "none";
    return;
  }

  empty.style.display  = "none";
  listEl.style.display = "flex";
  if (btnVerTudo) btnVerTudo.style.display = "inline-flex";

  licoes.forEach(l => {
    const item      = document.createElement("div");
    item.className  = "licao-item";
    const concluida = l.concluida;
    const acerto    = concluida ? Math.round((l.acertos / Math.max(l.total, 1)) * 100) : null;
    const cls       = acerto === null ? "" : acerto >= 70 ? "high" : acerto >= 40 ? "medium" : "low";
    const scoreText = concluida ? `${l.acertos}/${l.total} (${acerto}%)` : "Em andamento";
    const dataStr   = l.criadaEm?.toDate
      ? l.criadaEm.toDate().toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" })
      : "Recentemente";
    const totalQStr = l.totalQuestoes ? ` · ${l.totalQuestoes} questões` : "";
    const chevron   = concluida ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>` : "";

    item.innerHTML = `
      <div class="licao-left">
        <div class="licao-status ${concluida ? "ok" : "pend"}">${concluida ? "✓" : "⏳"}</div>
        <div class="licao-info">
          <h4>${l.topico}${totalQStr}</h4>
          <p>${dataStr}</p>
        </div>
      </div>
      <div class="licao-right-row">
        <span class="licao-score ${cls}">${scoreText}</span>
        ${chevron}
      </div>`;

    // Clicável apenas se concluída (tem respostas)
    if (concluida) {
      item.classList.add("clickable");
      item.title = "Ver revisão desta lição";
      item.addEventListener("click", () => {
        const p = new URLSearchParams({
          materiaId: MAT_ID,
          licaoId:   l.id,
        });
        window.location.href = `../historico/historico.html?${p}`;
      });
    }

    listEl.appendChild(item);
  });
}

function abrirModal(topico) {
  topicoSelecionado = topico;
  qtdSelecionada    = 5; // reset

  document.getElementById("modalIcon").textContent    = MAT_EMOJI;
  document.getElementById("modalTitle").textContent   = `Nova lição: ${topico}`;
  document.getElementById("modalTopico").textContent  = topico;
  document.getElementById("modalMateria").textContent = MAT_NOME;

  // Atualiza botões de quantidade
  document.querySelectorAll(".qtd-btn").forEach(b => {
    b.classList.toggle("active", Number(b.dataset.qtd) === qtdSelecionada);
  });

  document.getElementById("modalOverlay").classList.remove("hidden");
}

// Seletor de quantidade
document.getElementById("qtdGrid").addEventListener("click", e => {
  const btn = e.target.closest(".qtd-btn");
  if (!btn) return;
  qtdSelecionada = Number(btn.dataset.qtd);
  document.querySelectorAll(".qtd-btn").forEach(b =>
    b.classList.toggle("active", b === btn)
  );
  document.getElementById("qtdLabel").textContent =
    `${qtdSelecionada} questão${qtdSelecionada > 1 ? "s" : ""}`;
});

document.getElementById("btnCancel").addEventListener("click", fecharModal);
document.getElementById("modalOverlay").addEventListener("click", e => {
  if (e.target === document.getElementById("modalOverlay")) fecharModal();
});

function fecharModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  topicoSelecionado = null;
}

document.getElementById("btnConfirm").addEventListener("click", async () => {
  if (!topicoSelecionado || !uid) return;
  const btn = document.getElementById("btnConfirm");
  btn.disabled = true;
  btn.textContent = "Criando lição…";

  try {
    const licaoId = await criarLicao(uid, MAT_ID, topicoSelecionado, qtdSelecionada);
    const p = new URLSearchParams({
      licaoId,
      materiaId:    MAT_ID,
      materiaNome:  MAT_NOME,
      nivel:        MAT_NIVEL,
      escolaridade: ESCOLARIDADE,
      topico:       topicoSelecionado,
      emoji:        MAT_EMOJI,
      cor:          MAT_COR,
      total:        qtdSelecionada,
    });
    window.location.href = `../quiz/quiz.html?${p}`;
  } catch (e) {
    console.error("Erro ao criar lição:", e);
    btn.disabled    = false;
    btn.textContent = "Tentar novamente";
  }
});