// ─────────────────────────────────────────────────────────────
//  admin.js  –  painel administrativo (sem autenticação)
// ─────────────────────────────────────────────────────────────

import { db } from "../db/firebase.js";
import {
  doc, getDoc, setDoc, getDocs, addDoc, updateDoc, deleteDoc,
  collection, query, orderBy, where, limit, getCountFromServer,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ══════════════════════════════════════════════════════════════
//  ESTADO GLOBAL
// ══════════════════════════════════════════════════════════════
let catalogo      = [];      // lista de matérias
let todasQuestoes = [];      // questões carregadas
let editingMat    = null;    // índice da matéria sendo editada (no array)
let editingQId    = null;    // id do doc da questão sendo editada
let deleteAction  = null;    // fn a executar no confirm de delete

const PAGE_SIZE   = 15;
let currentPage   = 1;
let filteredQs    = [];

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", async () => {
  setupNav();
  setupModalClose();
  await Promise.all([carregarMaterias(), carregarQuestoes()]);
  setStatus(true);
});

function setStatus(ok) {
  const dot   = document.getElementById("statusDot");
  const label = document.getElementById("statusLabel");
  dot.className   = "status-dot " + (ok ? "ok" : "err");
  label.textContent = ok ? "Firebase OK" : "Erro na conexão";
}

// ══════════════════════════════════════════════════════════════
//  NAVEGAÇÃO
// ══════════════════════════════════════════════════════════════
function setupNav() {
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      if (btn.dataset.tab === "stats") carregarStats();
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  MATÉRIAS
// ══════════════════════════════════════════════════════════════
async function carregarMaterias() {
  try {
    const ref  = doc(db, "config", "materias");
    const snap = await getDoc(ref);
    catalogo   = snap.exists() ? (snap.data().lista ?? []) : [];
    renderMaterias();
    popularSelectMaterias();
  } catch (e) {
    setStatus(false);
    toast("Erro ao carregar matérias: " + e.message, "err");
  }
}

function renderMaterias() {
  const grid = document.getElementById("materiasGrid");
  grid.innerHTML = "";

  if (!catalogo.length) {
    grid.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;padding:40px 0">
      Nenhuma matéria cadastrada. Clique em "+ Nova matéria" para começar.
    </p>`;
    return;
  }

  catalogo.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "materia-card";
    card.style.setProperty("--card-color", m.cor ?? "#5f7cff");

    const topicosHtml = (m.topicos ?? [])
      .map(t => `<span class="topico-tag">${t}</span>`)
      .join("");

    card.innerHTML = `
      <div class="materia-card-head">
        <div class="materia-title-row">
          <div class="materia-emoji">${m.emoji ?? "📚"}</div>
          <div>
            <div class="materia-name">${m.nome}</div>
            <div class="materia-meta">${m.escolaridade ?? ""} · ${m.nivel ?? ""} · <code style="font-size:10px;color:var(--muted)">${m.id}</code></div>
          </div>
        </div>
        <div class="materia-card-actions">
          <button class="btn-icon edit" title="Editar" data-idx="${idx}">✏️</button>
          <button class="btn-icon del"  title="Excluir" data-idx="${idx}">🗑️</button>
        </div>
      </div>
      <div class="topicos-list">${topicosHtml || '<span style="color:var(--muted);font-size:11px">Sem tópicos</span>'}</div>
    `;

    card.querySelector(".edit").addEventListener("click", () => abrirModalEditarMateria(idx));
    card.querySelector(".del").addEventListener("click",  () => confirmarDeleteMateria(idx));
    grid.appendChild(card);
  });
}

// ── Abrir modal ───────────────────────────────────────────────
document.getElementById("btnNovaMateria").addEventListener("click", () => {
  editingMat = null;
  document.getElementById("modalMateriaTitle").textContent = "Nova matéria";
  limparFormMateria();
  abrirModal("modalMateria");
});

function abrirModalEditarMateria(idx) {
  editingMat = idx;
  const m = catalogo[idx];
  document.getElementById("modalMateriaTitle").textContent = "Editar matéria";
  document.getElementById("mId").value          = m.id;
  document.getElementById("mId").disabled       = true; // id não muda
  document.getElementById("mEmoji").value       = m.emoji ?? "";
  document.getElementById("mNome").value        = m.nome ?? "";
  document.getElementById("mEscolaridade").value = m.escolaridade ?? "Médio";
  document.getElementById("mNivel").value       = m.nivel ?? "";
  document.getElementById("mCor").value         = m.cor ?? "#5f7cff";
  document.getElementById("mCorPicker").value   = m.cor ?? "#5f7cff";
  document.getElementById("mNivelFiltro").value = m.nivelFiltro ?? "fund2";
  document.getElementById("mTopicos").value     = (m.topicos ?? []).join("\n");
  abrirModal("modalMateria");
}

function limparFormMateria() {
  ["mId","mEmoji","mNome","mNivel","mTopicos"].forEach(id =>
    (document.getElementById(id).value = "")
  );
  document.getElementById("mId").disabled       = false;
  document.getElementById("mCor").value         = "#5f7cff";
  document.getElementById("mCorPicker").value   = "#5f7cff";
  document.getElementById("mEscolaridade").value = "Fundamental II";
  document.getElementById("mNivelFiltro").value  = "fund2";
}

// Sync color picker ↔ text
document.getElementById("mCorPicker").addEventListener("input", e =>
  (document.getElementById("mCor").value = e.target.value)
);
document.getElementById("mCor").addEventListener("input", e => {
  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value))
    document.getElementById("mCorPicker").value = e.target.value;
});

// ── Salvar matéria ────────────────────────────────────────────
document.getElementById("btnSalvarMateria").addEventListener("click", async () => {
  const btn = document.getElementById("btnSalvarMateria");
  const id  = document.getElementById("mId").value.trim().toLowerCase().replace(/\s+/g,"_");
  const nome = document.getElementById("mNome").value.trim();

  if (!id || !nome) { toast("ID e Nome são obrigatórios", "err"); return; }

  const materia = {
    id,
    nome,
    emoji:        document.getElementById("mEmoji").value.trim() || "📚",
    escolaridade: document.getElementById("mEscolaridade").value,
    nivel:        document.getElementById("mNivel").value.trim(),
    cor:          document.getElementById("mCor").value.trim() || "#5f7cff",
    nivelFiltro:  document.getElementById("mNivelFiltro").value,
    topicos:      document.getElementById("mTopicos").value
                    .split("\n").map(s => s.trim()).filter(Boolean),
  };

  btn.disabled = true; btn.textContent = "Salvando…";

  try {
    if (editingMat !== null) {
      catalogo[editingMat] = materia;
    } else {
      // Verifica duplicata de ID
      if (catalogo.some(m => m.id === id)) {
        toast("Já existe uma matéria com esse ID", "err");
        btn.disabled = false; btn.textContent = "Salvar matéria"; return;
      }
      catalogo.push(materia);
    }

    await setDoc(doc(db, "config", "materias"), { lista: catalogo });
    fecharModal("modalMateria");
    renderMaterias();
    popularSelectMaterias();
    toast(editingMat !== null ? "Matéria atualizada!" : "Matéria criada!");
    editingMat = null;
  } catch (e) {
    toast("Erro: " + e.message, "err");
  } finally {
    btn.disabled = false; btn.textContent = "Salvar matéria";
  }
});

// ── Deletar matéria ───────────────────────────────────────────
function confirmarDeleteMateria(idx) {
  const m = catalogo[idx];
  document.getElementById("confirmMsg").textContent =
    `Excluir a matéria "${m.nome}"? Isso não remove as questões associadas.`;
  deleteAction = async () => {
    catalogo.splice(idx, 1);
    await setDoc(doc(db, "config", "materias"), { lista: catalogo });
    renderMaterias();
    popularSelectMaterias();
    toast("Matéria excluída");
  };
  abrirModal("modalConfirm");
}

// ══════════════════════════════════════════════════════════════
//  QUESTÕES
// ══════════════════════════════════════════════════════════════
async function carregarQuestoes() {
  try {
    const q    = query(collection(db, "questoes"), orderBy("criadaEm", "desc"), limit(500));
    const snap = await getDocs(q);
    todasQuestoes = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
    filteredQs    = [...todasQuestoes];
    currentPage   = 1;
    renderTabela();
  } catch (e) {
    document.querySelector("#questoesBody").innerHTML =
      `<tr><td colspan="6" class="loading-row" style="color:var(--err)">Erro: ${e.message}</td></tr>`;
  }
}

function renderTabela() {
  const tbody = document.getElementById("questoesBody");
  const start = (currentPage - 1) * PAGE_SIZE;
  const page  = filteredQs.slice(start, start + PAGE_SIZE);

  if (!filteredQs.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-row">Nenhuma questão encontrada</td></tr>`;
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  tbody.innerHTML = page.map(q => `
    <tr>
      <td class="td-pergunta" title="${q.pergunta ?? ""}">${q.pergunta ?? "—"}</td>
      <td>${q.materiaNome ?? q.materiaId ?? "—"}</td>
      <td>${q.topico ?? "—"}</td>
      <td>${q.nivel ?? "—"}</td>
      <td><span class="diff-badge ${q.dificuldade}">${q.dificuldade ?? "—"}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn-icon edit" data-id="${q._id}" title="Editar">✏️</button>
          <button class="btn-icon del"  data-id="${q._id}" title="Excluir">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");

  // Bind botões
  tbody.querySelectorAll(".edit").forEach(btn =>
    btn.addEventListener("click", () =>
      abrirModalEditarQuestao(todasQuestoes.find(q => q._id === btn.dataset.id))
    )
  );
  tbody.querySelectorAll(".del").forEach(btn =>
    btn.addEventListener("click", () => confirmarDeleteQuestao(btn.dataset.id))
  );

  renderPaginacao();
}

function renderPaginacao() {
  const totalPags = Math.ceil(filteredQs.length / PAGE_SIZE);
  const pg = document.getElementById("pagination");

  if (totalPags <= 1) { pg.innerHTML = ""; return; }

  let html = "";
  for (let i = 1; i <= totalPags; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active":""}" data-p="${i}">${i}</button>`;
  }
  pg.innerHTML = html;
  pg.querySelectorAll(".page-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      currentPage = Number(btn.dataset.p);
      renderTabela();
    })
  );
}

// ── Filtrar ───────────────────────────────────────────────────
document.getElementById("btnFiltrar").addEventListener("click", () => {
  const mat  = document.getElementById("filterMateria").value;
  const top  = document.getElementById("filterTopico").value;
  const diff = document.getElementById("filterDiff").value;

  filteredQs = todasQuestoes.filter(q =>
    (!mat  || q.materiaId  === mat)  &&
    (!top  || q.topico     === top)  &&
    (!diff || q.dificuldade === diff)
  );
  currentPage = 1;
  renderTabela();
});

// Ao mudar matéria no filtro, atualiza tópicos disponíveis
document.getElementById("filterMateria").addEventListener("change", () => {
  const mid = document.getElementById("filterMateria").value;
  const mat = catalogo.find(m => m.id === mid);
  const sel = document.getElementById("filterTopico");
  sel.innerHTML = '<option value="">Todos os tópicos</option>';
  if (mat) {
    (mat.topicos ?? []).forEach(t => {
      const o = document.createElement("option"); o.value = o.textContent = t;
      sel.appendChild(o);
    });
  }
});

// ── Popular selects ───────────────────────────────────────────
function popularSelectMaterias() {
  // Filter bar
  const sel = document.getElementById("filterMateria");
  sel.innerHTML = '<option value="">Todas as matérias</option>';
  catalogo.forEach(m => {
    const o = document.createElement("option"); o.value = m.id; o.textContent = m.nome;
    sel.appendChild(o);
  });

  // Modal questão - matéria
  const qSel = document.getElementById("qMateria");
  qSel.innerHTML = "";
  catalogo.forEach(m => {
    const o = document.createElement("option"); o.value = m.id; o.textContent = m.nome;
    qSel.appendChild(o);
  });
  atualizarTopicosQuestao();
}

function atualizarTopicosQuestao() {
  const mid = document.getElementById("qMateria").value;
  const mat = catalogo.find(m => m.id === mid);
  const sel = document.getElementById("qTopico");
  sel.innerHTML = "";
  (mat?.topicos ?? ["Geral"]).forEach(t => {
    const o = document.createElement("option"); o.value = o.textContent = t;
    sel.appendChild(o);
  });
  // Preenche nível/escolaridade automaticamente
  if (mat) {
    document.getElementById("qNivel").value       = mat.nivel ?? "";
    document.getElementById("qEscolaridade").value = mat.escolaridade ?? "";
  }
}

document.getElementById("qMateria").addEventListener("change", atualizarTopicosQuestao);

// ── Modal nova / editar questão ───────────────────────────────
document.getElementById("btnNovaQuestao").addEventListener("click", () => {
  editingQId = null;
  document.getElementById("modalQuestaoTitle").textContent = "Nova questão";
  limparFormQuestao();
  abrirModal("modalQuestao");
});

function abrirModalEditarQuestao(q) {
  editingQId = q._id;
  document.getElementById("modalQuestaoTitle").textContent = "Editar questão";

  // Seta matéria e tópico
  const qSel = document.getElementById("qMateria");
  qSel.value = q.materiaId ?? "";
  atualizarTopicosQuestao();
  document.getElementById("qTopico").value       = q.topico       ?? "";
  document.getElementById("qNivel").value        = q.nivel        ?? "";
  document.getElementById("qEscolaridade").value = q.escolaridade ?? "";
  document.getElementById("qDiff").value         = q.dificuldade  ?? "Médio";
  document.getElementById("qPergunta").value     = q.pergunta     ?? "";
  document.getElementById("qOpcoes").value       = (q.opcoes ?? []).join("\n");
  document.getElementById("qExplicacao").value   = q.explicacao   ?? "";
  setCorreta(q.correta ?? 0);

  abrirModal("modalQuestao");
}

function limparFormQuestao() {
  document.getElementById("qPergunta").value   = "";
  document.getElementById("qOpcoes").value     = "";
  document.getElementById("qExplicacao").value = "";
  document.getElementById("qDiff").value       = "Médio";
  setCorreta(0);
  atualizarTopicosQuestao();
}

// Seletor de resposta correta
let corretaIdx = 0;
function setCorreta(idx) {
  corretaIdx = idx;
  document.querySelectorAll(".correta-btn").forEach((btn, i) =>
    btn.classList.toggle("active", i === idx)
  );
}
document.getElementById("corretaRow").addEventListener("click", e => {
  const btn = e.target.closest(".correta-btn");
  if (btn) setCorreta(Number(btn.dataset.idx));
});

// ── Salvar questão ────────────────────────────────────────────
document.getElementById("btnSalvarQuestao").addEventListener("click", async () => {
  const btn = document.getElementById("btnSalvarQuestao");

  const mid   = document.getElementById("qMateria").value;
  const mat   = catalogo.find(m => m.id === mid);
  const opcRaw = document.getElementById("qOpcoes").value
                  .split("\n").map(s => s.trim()).filter(Boolean);
  const pergunta = document.getElementById("qPergunta").value.trim();

  if (!pergunta)         { toast("Digite a pergunta", "err"); return; }
  if (opcRaw.length < 2) { toast("Adicione pelo menos 2 opções", "err"); return; }

  const data = {
    materiaId:    mid,
    materiaNome:  mat?.nome ?? mid,
    topico:       document.getElementById("qTopico").value,
    nivel:        document.getElementById("qNivel").value.trim(),
    escolaridade: document.getElementById("qEscolaridade").value.trim(),
    dificuldade:  document.getElementById("qDiff").value,
    pergunta,
    opcoes:       opcRaw,
    correta:      corretaIdx,
    explicacao:   document.getElementById("qExplicacao").value.trim(),
  };

  btn.disabled = true; btn.textContent = "Salvando…";

  try {
    if (editingQId) {
      await updateDoc(doc(db, "questoes", editingQId), data);
      const idx = todasQuestoes.findIndex(q => q._id === editingQId);
      if (idx !== -1) todasQuestoes[idx] = { _id: editingQId, ...data };
      toast("Questão atualizada!");
    } else {
      data.criadaEm = serverTimestamp();
      const ref = await addDoc(collection(db, "questoes"), data);
      todasQuestoes.unshift({ _id: ref.id, ...data });
      toast("Questão criada!");
    }

    filteredQs = [...todasQuestoes];
    fecharModal("modalQuestao");
    renderTabela();
  } catch (e) {
    toast("Erro: " + e.message, "err");
  } finally {
    btn.disabled = false; btn.textContent = "Salvar questão";
  }
});

// ── Deletar questão ───────────────────────────────────────────
function confirmarDeleteQuestao(id) {
  const q = todasQuestoes.find(q => q._id === id);
  document.getElementById("confirmMsg").textContent =
    `Excluir a questão "${(q?.pergunta ?? "").slice(0,80)}…"?`;
  deleteAction = async () => {
    await deleteDoc(doc(db, "questoes", id));
    todasQuestoes = todasQuestoes.filter(q => q._id !== id);
    filteredQs    = filteredQs.filter(q => q._id !== id);
    renderTabela();
    toast("Questão excluída");
  };
  abrirModal("modalConfirm");
}

// ── Confirm delete btn ────────────────────────────────────────
document.getElementById("btnConfirmDelete").addEventListener("click", async () => {
  if (!deleteAction) return;
  const btn = document.getElementById("btnConfirmDelete");
  btn.disabled = true; btn.textContent = "Excluindo…";
  try {
    await deleteAction();
    fecharModal("modalConfirm");
  } catch (e) {
    toast("Erro: " + e.message, "err");
  } finally {
    btn.disabled = false; btn.textContent = "Excluir";
    deleteAction = null;
  }
});

// ══════════════════════════════════════════════════════════════
//  ESTATÍSTICAS
// ══════════════════════════════════════════════════════════════
async function carregarStats() {
  document.getElementById("statMaterias").textContent = catalogo.length;

  const totalTopicos = catalogo.reduce((s, m) => s + (m.topicos?.length ?? 0), 0);
  document.getElementById("statTopicos").textContent = totalTopicos;

  document.getElementById("statQuestoes").textContent = todasQuestoes.length;

  // Conta lições (todos os usuários) — coleção de grupo
  try {
    const licoesSnap = await getDocs(query(
      collection(db, "usuarios"),
    ));
    // aproximação: conta a partir do total de questões geradas / 5
    document.getElementById("statLicoes").textContent =
      Math.floor(todasQuestoes.length / 5) || "—";
  } catch (_) {
    document.getElementById("statLicoes").textContent = "—";
  }

  // Bar chart por matéria
  const contPorMateria = {};
  todasQuestoes.forEach(q => {
    const n = q.materiaNome ?? q.materiaId ?? "Outros";
    contPorMateria[n] = (contPorMateria[n] ?? 0) + 1;
  });
  const maxBar = Math.max(1, ...Object.values(contPorMateria));
  const barChart = document.getElementById("barChart");
  barChart.innerHTML = Object.entries(contPorMateria)
    .sort((a,b) => b[1]-a[1])
    .map(([nome, cnt]) => `
      <div class="bar-row">
        <span class="bar-label">${nome}</span>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(cnt/maxBar*100).toFixed(1)}%"></div>
        </div>
        <span class="bar-count">${cnt}</span>
      </div>
    `).join("") || '<p style="color:var(--muted);font-size:12px">Sem questões ainda</p>';

  // Dificuldades
  const facil   = todasQuestoes.filter(q => q.dificuldade === "Fácil").length;
  const medio   = todasQuestoes.filter(q => q.dificuldade === "Médio").length;
  const dificil = todasQuestoes.filter(q => q.dificuldade === "Difícil").length;
  document.getElementById("diffBars").innerHTML = `
    <div class="diff-stat easy">
      <div class="diff-stat-val">${facil}</div>
      <div class="diff-stat-lbl">Fácil</div>
    </div>
    <div class="diff-stat med">
      <div class="diff-stat-val">${medio}</div>
      <div class="diff-stat-lbl">Médio</div>
    </div>
    <div class="diff-stat hard">
      <div class="diff-stat-val">${dificil}</div>
      <div class="diff-stat-lbl">Difícil</div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════
//  UTILITÁRIOS — MODAL
// ══════════════════════════════════════════════════════════════
function abrirModal(id)  { document.getElementById(id).classList.remove("hidden"); }
function fecharModal(id) { document.getElementById(id).classList.add("hidden"); }

function setupModalClose() {
  document.querySelectorAll("[data-close]").forEach(btn =>
    btn.addEventListener("click", () => fecharModal(btn.dataset.close))
  );
  document.querySelectorAll(".modal-overlay").forEach(overlay =>
    overlay.addEventListener("click", e => {
      if (e.target === overlay) fecharModal(overlay.id);
    })
  );
}

// ══════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════
let toastTimer = null;
function toast(msg, type = "ok") {
  const el = document.getElementById("toast");
  el.textContent  = msg;
  el.className    = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
}
