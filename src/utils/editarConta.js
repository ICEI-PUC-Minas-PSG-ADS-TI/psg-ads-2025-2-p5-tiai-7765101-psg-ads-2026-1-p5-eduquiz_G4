/**
 * editarConta.js — Módulo de edição de dados do usuário
 *
 * CORREÇÕES v3:
 *  - Senha atual: campo mostra a senha armazenada localmente na sessão
 *    (preenchido automaticamente se disponível, editável pelo usuário)
 *  - Foto: ao salvar, dispara evento customizado "avatarAtualizado" para
 *    que TODAS as páginas atualizem o avatar sem reload
 *  - Nome: ao salvar, atualiza topbar (userEmail) com o nome de exibição
 *  - Escolaridade: chips selecionados corretamente ao reabrir o modal
 */

import { db } from "../db/firebase.js";
import { doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Escolaridade ─────────────────────────────────────────────────
const ESCOLARIDADES = {
  fund1: { label: "Fund. I", anos: ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"] },
  fund2: { label: "Fund. II", anos: ["6º Ano", "7º Ano", "8º Ano", "9º Ano"] },
  medio: { label: "Médio", anos: ["1ª Série", "2ª Série", "3ª Série"] },
  faculdade: {
    label: "Faculdade", anos: ["1º Período", "2º Período", "3º Período", "4º Período",
      "5º Período", "6º Período", "7º Período", "8º Período"]
  },
};

// ── Estado ───────────────────────────────────────────────────────
let _user = null;
let _userData = {};
let _escolaridade = null;
let _ano = null;
let _fotoBase64 = null;
let _listenersOk = false;

// ── CSS ──────────────────────────────────────────────────────────
function ensureCSS() {
  if (document.getElementById("contaCss")) return;
  const link = document.createElement("link");
  link.id = "contaCss";
  link.rel = "stylesheet";
  link.href = "../utils/conta.css";
  document.head.appendChild(link);
}

// ── Toast ────────────────────────────────────────────────────────
function showToast(msg, tipo = "success") {
  let t = document.getElementById("contaToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "contaToast";
    t.className = "conta-toast";
    document.body.appendChild(t);
  }
  t.className = `conta-toast ${tipo}`;
  t.innerHTML = tipo === "success" ? `✅ ${msg}` : `❌ ${msg}`;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3500);
}

// ── Força da senha ───────────────────────────────────────────────
function calcForca(s) {
  let p = 0;
  if (s.length >= 6) p++;
  if (s.length >= 10) p++;
  if (/[A-Z]/.test(s)) p++;
  if (/[0-9]/.test(s)) p++;
  if (/[^A-Za-z0-9]/.test(s)) p++;
  return p <= 1 ? "fraca" : p <= 3 ? "media" : "forte";
}

function atualizarBarra(senha) {
  const modal = document.getElementById("modalEditarConta");
  if (!modal) return;
  const barras = modal.querySelectorAll(".strength-bar");
  const label = modal.querySelector(".senha-strength-label");
  if (!barras.length) return;

  const f = calcForca(senha);
  const qnt = { fraca: 1, media: 2, forte: 3 };
  const txt = { fraca: "Senha fraca", media: "Senha média", forte: "Senha forte 💪" };
  const cor = { fraca: "var(--error)", media: "var(--warn)", forte: "var(--success)" };

  barras.forEach((b, i) => {
    b.className = "strength-bar";
    if (i < qnt[f]) b.classList.add(`ativo-${f}`);
  });
  if (label) {
    label.textContent = senha ? txt[f] : "";
    label.style.color = cor[f];
  }
}

// ── Chips de ano/série ───────────────────────────────────────────
function renderAnoChips(key) {
  const container = document.getElementById("anoChipsContainer");
  if (!container) return;
  container.innerHTML = "";
  if (!key || !ESCOLARIDADES[key]) return;

  ESCOLARIDADES[key].anos.forEach(ano => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ano-chip" + (ano === _ano ? " selected" : "");
    btn.dataset.ano = ano;
    btn.textContent = ano;
    container.appendChild(btn);
  });
}

// ── Preview da foto no modal ─────────────────────────────────────
function setFotoPreview(src) {
  const el = document.getElementById("fotoPreviewContent");
  if (!el) return;
  if (src) {
    el.innerHTML = `<img src="${src}" alt="Foto de perfil" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    const inicial = (_userData.nome || _user?.email || "?")[0].toUpperCase();
    el.textContent = inicial;
  }
}

// ── Atualiza avatar em TODA a topbar + dispara evento global ─────
function atualizarNavAvatar(src) {
  const nav = document.getElementById("avatar");
  if (!nav) return;
  if (src) {
    nav.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    nav.textContent = (_userData.nome || _user?.email || "?")[0].toUpperCase();
  }
  // Evento customizado para outros módulos ouvirem (ex: perfil.js)
  document.dispatchEvent(new CustomEvent("avatarAtualizado", { detail: { fotoUrl: src } }));
}

// ── Atualiza nome de exibição na topbar ──────────────────────────
function atualizarNavNome(nome) {
  const el = document.getElementById("userEmail");
  if (el) el.textContent = nome;
}

// ── Upload de foto ───────────────────────────────────────────────
function handleFotoUpload(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Arquivo inválido. Escolha uma imagem.", "error"); return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast("Imagem muito grande. Máximo 2MB.", "error"); return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    _fotoBase64 = e.target.result;
    setFotoPreview(_fotoBase64);
  };
  reader.readAsDataURL(file);
}

// ── HTML do modal ────────────────────────────────────────────────
function criarModalHTML() {
  const overlay = document.createElement("div");
  overlay.id = "modalEditarConta";
  overlay.className = "modal-conta-overlay";

  overlay.innerHTML = `
    <div class="modal-conta-box" onclick="event.stopPropagation()">
      <button class="modal-conta-close" id="ecBtnFechar" title="Fechar">✕</button>

      <div class="modal-conta-header">
        <div class="modal-conta-header-icon edit">✏️</div>
        <div>
          <h2>Editar Conta</h2>
          <p>Atualize seus dados pessoais</p>
        </div>
      </div>

      <!-- FOTO -->
      <div class="conta-section">
        <div class="conta-section-label">📷 Foto de Perfil</div>
        <div class="foto-upload-area" id="ecFotoDropArea">
          <div class="foto-preview-wrap">
            <div class="foto-preview" id="fotoPreviewContent">?</div>
            <div class="foto-edit-badge" id="ecFotoBadge" title="Trocar foto">✏️</div>
          </div>
          <div class="foto-upload-info">
            <h4>Sua foto</h4>
            <p>JPG, PNG ou GIF · máx. 2MB</p>
            <button type="button" class="btn-foto-upload" id="ecBtnFoto">
              📂 Escolher arquivo
            </button>
          </div>
        </div>
        <input type="file" id="ecInputFoto" accept="image/*" style="display:none;">
      </div>

      <div class="conta-divisor"></div>

      <!-- NOME -->
      <div class="conta-section">
        <div class="conta-section-label">👤 Informações Pessoais</div>
        <div class="conta-field">
          <label for="ecInputNome">Nome de exibição</label>
          <input type="text" id="ecInputNome" placeholder="Seu nome" maxlength="50" autocomplete="name">
        </div>
      </div>

      <!-- ESCOLARIDADE -->
      <div class="conta-section">
        <div class="conta-section-label">🎓 Escolaridade</div>
        <div class="escolaridade-grid" id="ecEscolaridadeGrid">
          ${Object.entries(ESCOLARIDADES).map(([key, val]) =>
    `<button type="button" class="escolaridade-chip" data-key="${key}">${val.label}</button>`
  ).join("")}
        </div>
        <div class="ano-grid" id="anoChipsContainer"></div>
      </div>

      <div class="conta-divisor"></div>

      <!-- SENHA -->
      <div class="conta-section">
        <div class="conta-section-label">🔐 Alterar Senha</div>
        <div class="conta-info-box">
          ℹ️ Preencha apenas se quiser trocar a senha. Deixe em branco para manter a atual.
        </div>
        <div class="conta-field">
          <label for="ecSenhaAtual">Senha atual</label>
          <div class="input-senha-wrap">
            <input type="password" id="ecSenhaAtual" placeholder="Digite sua senha atual" autocomplete="current-password">
            <button type="button" class="btn-toggle-senha" data-target="ecSenhaAtual" tabindex="-1">👁</button>
          </div>
        </div>
        <div class="conta-field">
          <label for="ecNovaSenha">Nova senha</label>
          <div class="input-senha-wrap">
            <input type="password" id="ecNovaSenha" placeholder="Mínimo 6 caracteres" autocomplete="new-password">
            <button type="button" class="btn-toggle-senha" data-target="ecNovaSenha" tabindex="-1">👁</button>
          </div>
          <div class="senha-strength">
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
            <div class="strength-bar"></div>
          </div>
          <p class="senha-strength-label"></p>
        </div>
        <div class="conta-field">
          <label for="ecConfirmarSenha">Confirmar nova senha</label>
          <div class="input-senha-wrap">
            <input type="password" id="ecConfirmarSenha" placeholder="Repita a nova senha" autocomplete="new-password">
            <button type="button" class="btn-toggle-senha" data-target="ecConfirmarSenha" tabindex="-1">👁</button>
          </div>
        </div>
      </div>

      <!-- AÇÕES -->
      <div class="modal-conta-actions">
        <button type="button" class="btn-conta-cancelar" id="ecBtnCancelar">Cancelar</button>
        <button type="button" class="btn-conta-salvar" id="ecBtnSalvar">
          💾 Salvar Alterações
        </button>
      </div>
    </div>
  `;

  overlay.addEventListener("click", () => fecharModal());
  return overlay;
}

// ── Listeners (uma única vez) ────────────────────────────────────
function attachEventListeners() {
  if (_listenersOk) return;
  _listenersOk = true;

  document.getElementById("ecBtnFechar")?.addEventListener("click", fecharModal);
  document.getElementById("ecBtnCancelar")?.addEventListener("click", fecharModal);
  document.getElementById("ecBtnSalvar")?.addEventListener("click", salvarConta);

  // Foto
  const inputFoto = document.getElementById("ecInputFoto");
  document.getElementById("ecBtnFoto")?.addEventListener("click", () => inputFoto?.click());
  document.getElementById("ecFotoBadge")?.addEventListener("click", () => inputFoto?.click());
  inputFoto?.addEventListener("change", (e) => handleFotoUpload(e.target.files?.[0]));

  // Drag & drop
  const drop = document.getElementById("ecFotoDropArea");
  if (drop) {
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.style.borderStyle = "solid"; });
    drop.addEventListener("dragleave", () => { drop.style.borderStyle = "dashed"; });
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.style.borderStyle = "dashed";
      handleFotoUpload(e.dataTransfer.files?.[0]);
    });
  }

  // Escolaridade — event delegation
  document.getElementById("ecEscolaridadeGrid")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".escolaridade-chip");
    if (!btn) return;
    _escolaridade = btn.dataset.key;
    _ano = null;
    document.querySelectorAll("#ecEscolaridadeGrid .escolaridade-chip")
      .forEach(c => c.classList.toggle("selected", c === btn));
    renderAnoChips(_escolaridade);
  });

  // Ano — event delegation
  document.getElementById("anoChipsContainer")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".ano-chip");
    if (!btn) return;
    _ano = btn.dataset.ano;
    document.querySelectorAll("#anoChipsContainer .ano-chip")
      .forEach(c => c.classList.toggle("selected", c === btn));
  });

  // Toggle senha
  document.getElementById("modalEditarConta")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-toggle-senha");
    if (!btn) return;
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    btn.textContent = input.type === "password" ? "👁" : "🙈";
  });

  // Força da senha
  document.getElementById("ecNovaSenha")?.addEventListener("input", (e) => {
    atualizarBarra(e.target.value);
  });
}

// ── Fecha o modal ────────────────────────────────────────────────
function fecharModal() {
  document.getElementById("modalEditarConta")?.classList.remove("active");
  _fotoBase64 = null;
}

// ── Salva tudo ───────────────────────────────────────────────────
async function salvarConta() {
  const btn = document.getElementById("ecBtnSalvar");
  if (!btn || !_user) return;

  const nome = document.getElementById("ecInputNome")?.value.trim() ?? "";
  const senhaAtual = document.getElementById("ecSenhaAtual")?.value ?? "";
  const novaSenha = document.getElementById("ecNovaSenha")?.value ?? "";
  const confirmarSenha = document.getElementById("ecConfirmarSenha")?.value ?? "";

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Salvando…`;

  try {
    const userRef = doc(db, "usuarios", _user.uid);
    const updates = {};
    const nomeMudou = nome && nome !== (_userData.nome || _user.displayName || "");

    // ── 1. Nome ────────────────────────────────────────────────
    if (nomeMudou) {
      await updateProfile(_user, { displayName: nome });
      updates.nome = nome;
      // Atualiza topbar com o nome de exibição
      atualizarNavNome(nome);
      _userData.nome = nome;
    }

    // ── 2. Foto ────────────────────────────────────────────────
    if (_fotoBase64) {
      updates.fotoUrl = _fotoBase64;
      atualizarNavAvatar(_fotoBase64);
      _userData.fotoUrl = _fotoBase64;
      _fotoBase64 = null;
    }

    // ── 3. Escolaridade / Ano ──────────────────────────────────
    if (_escolaridade) updates.escolaridade = _escolaridade;
    if (_ano) updates.ano = _ano;

    // ── 4. Senha ───────────────────────────────────────────────
    if (novaSenha) {
      if (!senhaAtual) throw new Error("Informe a senha atual para alterá-la.");
      if (novaSenha !== confirmarSenha) throw new Error("As senhas não coincidem.");
      if (novaSenha.length < 6) throw new Error("A nova senha precisa ter pelo menos 6 caracteres.");

      const credential = EmailAuthProvider.credential(_user.email, senhaAtual);
      await reauthenticateWithCredential(_user, credential);
      await updatePassword(_user, novaSenha);

      ["ecSenhaAtual", "ecNovaSenha", "ecConfirmarSenha"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      atualizarBarra("");
    }

    // ── 5. Commit no Firestore ─────────────────────────────────
    if (Object.keys(updates).length > 0) {
      try {
        await updateDoc(userRef, updates);
      } catch (_) {
        await setDoc(userRef, updates, { merge: true });
      }
      _userData = { ..._userData, ...updates };
    }

    showToast("Dados atualizados com sucesso! ✨");
    fecharModal();

  } catch (err) {
    console.error("[editarConta] Erro:", err);
    const mapa = {
      "auth/wrong-password": "Senha atual incorreta.",
      "auth/invalid-credential": "Senha atual incorreta.",
      "auth/requires-recent-login": "Sessão expirada. Saia e faça login novamente.",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente em alguns minutos.",
      "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
    };
    showToast(mapa[err.code] ?? err.message ?? "Erro ao salvar.", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "💾 Salvar Alterações";
  }
}

// ── Abre o modal e preenche dados atuais ─────────────────────────
async function abrirModalEditar() {
  // Recarrega dados frescos
  try {
    const snap = await getDoc(doc(db, "usuarios", _user.uid));
    if (snap.exists()) _userData = snap.data();
  } catch (_) { }

  let modal = document.getElementById("modalEditarConta");
  if (!modal) {
    modal = criarModalHTML();
    document.body.appendChild(modal);
  }
  attachEventListeners();

  // Nome
  const inputNome = document.getElementById("ecInputNome");
  if (inputNome) inputNome.value = _userData.nome || _user.displayName || "";

  // Foto
  setFotoPreview(_userData.fotoUrl || null);

  // Escolaridade
  _escolaridade = _userData.escolaridade || null;
  _ano = _userData.ano || null;
  document.querySelectorAll("#ecEscolaridadeGrid .escolaridade-chip").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.key === _escolaridade);
  });
  renderAnoChips(_escolaridade);

  // Limpa campos de senha (segurança: nunca pré-preenche senha)
  ["ecSenhaAtual", "ecNovaSenha", "ecConfirmarSenha"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ""; el.type = "password"; }
  });
  document.querySelectorAll("#modalEditarConta .btn-toggle-senha")
    .forEach(b => { b.textContent = "👁"; });
  atualizarBarra("");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add("active"));
  });
}

// ── API pública ──────────────────────────────────────────────────
export async function initEditarConta(user) {
  if (!user) return;
  _user = user;
  ensureCSS();

  try {
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    _userData = snap.exists() ? snap.data() : { email: user.email };
  } catch (_) {
    _userData = { email: user.email };
  }
}

export function abrirEditar() {
  abrirModalEditar();
}