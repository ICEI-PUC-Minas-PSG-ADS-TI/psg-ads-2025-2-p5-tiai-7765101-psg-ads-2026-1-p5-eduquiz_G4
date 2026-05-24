/**
 * excluirConta.js — Módulo de exclusão permanente de conta
 *
 * Funcionalidades:
 *  - Modal com aviso de impacto detalhado
 *  - Confirmação via digitação do e-mail
 *  - Reautenticação obrigatória antes de excluir
 *  - Remove dados do Firestore + conta do Firebase Auth
 *
 * Uso:
 *   import { initExcluirConta, abrirExcluir } from "../utils/excluirConta.js";
 *   initExcluirConta(user);
 *   // Para abrir: abrirExcluir()
 */

import { db, auth } from "../db/firebase.js";
import {
  doc, deleteDoc, collection, getDocs, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ── Estado interno ───────────────────────────────────────────────
let _user = null;

// ── CSS lazy-load (compartilhado com editarConta.js) ────────────
function ensureCSS() {
  if (!document.getElementById("contaCss")) {
    const link = document.createElement("link");
    link.id = "contaCss";
    link.rel = "stylesheet";
    link.href = "../utils/conta.css";
    document.head.appendChild(link);
  }
}

// ── Toast helper ─────────────────────────────────────────────────
function showToast(msg, tipo = "success") {
  let toast = document.getElementById("contaToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "contaToast";
    toast.className = "conta-toast";
    document.body.appendChild(toast);
  }
  toast.className = `conta-toast ${tipo}`;
  toast.innerHTML = tipo === "success" ? `✅ ${msg}` : `❌ ${msg}`;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 4000);
}

// ── Deleta subcoleções do usuário no Firestore ───────────────────
async function deletarSubcolecoes(uid) {
  const batch = writeBatch(db);

  // Matérias e lições aninhadas
  try {
    const materiasSnap = await getDocs(collection(db, "usuarios", uid, "materias"));
    for (const matDoc of materiasSnap.docs) {
      const licoesSnap = await getDocs(
        collection(db, "usuarios", uid, "materias", matDoc.id, "licoes")
      );
      for (const licaoDoc of licoesSnap.docs) {
        // Respostas dentro de cada lição
        try {
          const respostasSnap = await getDocs(
            collection(db, "usuarios", uid, "materias", matDoc.id, "licoes", licaoDoc.id, "respostas")
          );
          respostasSnap.docs.forEach(r => batch.delete(r.ref));
        } catch (_) {}
        batch.delete(licaoDoc.ref);
      }
      batch.delete(matDoc.ref);
    }
  } catch (_) {}

  // Documento principal do usuário
  batch.delete(doc(db, "usuarios", uid));

  // Ranking (se existir)
  try {
    batch.delete(doc(db, "ranking", uid));
  } catch (_) {}

  await batch.commit();
}

// ── Cria o HTML do modal ─────────────────────────────────────────
function criarModalExcluirHTML() {
  const overlay = document.createElement("div");
  overlay.id = "modalExcluirConta";
  overlay.className = "modal-conta-overlay";

  const email = _user?.email || "sua conta";

  overlay.innerHTML = `
    <div class="modal-conta-box" onclick="event.stopPropagation()">
      <button class="modal-conta-close" id="btnFecharExcluir" title="Fechar">✕</button>

      <div class="modal-conta-header">
        <div class="modal-conta-header-icon delete">⚠️</div>
        <div>
          <h2>Excluir Conta</h2>
          <p>Esta ação é irreversível</p>
        </div>
      </div>

      <!-- AVISO VISUAL -->
      <div class="excluir-warning">
        <span class="excluir-warning-icon">🗑️</span>
        <h3>Tem certeza absoluta?</h3>
        <p>
          Ao excluir sua conta, <strong>todos os seus dados serão removidos permanentemente</strong>
          dos nossos servidores e não poderão ser recuperados.
        </p>

        <ul class="excluir-lista">
          <li>Todo o seu histórico de lições</li>
          <li>Seu progresso em todas as matérias</li>
          <li>Seus pontos XP e nível</li>
          <li>Suas conquistas e badges</li>
          <li>Seus dados de perfil e foto</li>
          <li>Sua posição no ranking</li>
        </ul>
      </div>

      <!-- SENHA PARA CONFIRMAR -->
      <div class="conta-section">
        <div class="conta-section-label">🔐 Confirmação de Segurança</div>
        <div class="conta-info-box">
          ℹ️ Por segurança, confirme sua senha para prosseguir com a exclusão.
        </div>
        <div class="conta-field">
          <label for="inputSenhaExcluir">Sua senha atual</label>
          <div class="input-senha-wrap">
            <input
              type="password"
              id="inputSenhaExcluir"
              placeholder="Digite sua senha"
              autocomplete="current-password"
            >
            <button type="button" class="btn-toggle-senha" data-target="inputSenhaExcluir">👁</button>
          </div>
        </div>
      </div>

      <!-- CONFIRMAÇÃO DIGITANDO E-MAIL -->
      <div class="conta-section">
        <label class="excluir-confirmar-label">
          Digite <span>${email}</span> para confirmar:
        </label>
        <div class="conta-field">
          <input
            type="email"
            id="inputConfirmarEmail"
            placeholder="${email}"
            autocomplete="off"
            spellcheck="false"
          >
        </div>
      </div>

      <!-- BOTÃO EXCLUIR -->
      <button
        type="button"
        class="btn-confirmar-excluir"
        id="btnConfirmarExcluir"
        disabled
      >
        🗑️ Excluir minha conta permanentemente
      </button>

      <!-- CANCELAR -->
      <div style="text-align:center; margin-top: 1rem;">
        <button type="button" class="btn-conta-cancelar" id="btnCancelarExcluir" style="border: none; background: none; color: var(--text-muted); font-size: 0.85rem; cursor: pointer; font-family: inherit; font-weight: 700;">
          ← Cancelar e manter minha conta
        </button>
      </div>
    </div>
  `;

  overlay.onclick = () => fecharModal("modalExcluirConta");
  return overlay;
}

// ── Fecha modal ──────────────────────────────────────────────────
function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

// ── Executa a exclusão ───────────────────────────────────────────
async function executarExclusao() {
  const btn = document.getElementById("btnConfirmarExcluir");
  const senha = document.getElementById("inputSenhaExcluir")?.value;

  if (!senha) {
    showToast("Informe sua senha para continuar.", "error");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Excluindo…`;

  try {
    // 1. Reautenticar
    const credential = EmailAuthProvider.credential(_user.email, senha);
    await reauthenticateWithCredential(_user, credential);

    // 2. Deletar dados do Firestore
    await deletarSubcolecoes(_user.uid);

    // 3. Deletar a conta do Firebase Auth
    await deleteUser(_user);

    // 4. Redireciona para login
    showToast("Conta excluída. Até logo! 👋");
    setTimeout(() => {
      window.location.href = "../login/login.html";
    }, 1800);

  } catch (err) {
    const msg = err.code === "auth/wrong-password"
      ? "Senha incorreta. Tente novamente."
      : err.code === "auth/requires-recent-login"
      ? "Sessão expirada. Faça login novamente antes de excluir."
      : err.code === "auth/too-many-requests"
      ? "Muitas tentativas. Aguarde alguns minutos."
      : "Erro ao excluir conta. Tente novamente.";

    showToast(msg, "error");
    btn.disabled = false;
    btn.innerHTML = "🗑️ Excluir minha conta permanentemente";
    // Revalida o botão
    validarBotaoExcluir();
  }
}

// ── Valida habilitação do botão de exclusão ──────────────────────
function validarBotaoExcluir() {
  const btn = document.getElementById("btnConfirmarExcluir");
  const emailInput = document.getElementById("inputConfirmarEmail");
  if (!btn || !emailInput) return;
  const correto = emailInput.value.trim().toLowerCase() === _user?.email?.toLowerCase();
  btn.disabled = !correto;
}

// ── Listeners do modal ───────────────────────────────────────────
function attachExcluirListeners() {
  document.getElementById("btnFecharExcluir")?.addEventListener("click", () => fecharModal("modalExcluirConta"));
  document.getElementById("btnCancelarExcluir")?.addEventListener("click", () => fecharModal("modalExcluirConta"));
  document.getElementById("btnConfirmarExcluir")?.addEventListener("click", executarExclusao);

  // Valida e-mail em tempo real
  document.getElementById("inputConfirmarEmail")?.addEventListener("input", validarBotaoExcluir);

  // Toggle senha
  document.querySelectorAll("#modalExcluirConta .btn-toggle-senha").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁" : "🙈";
    });
  });
}

// ── Abre o modal ─────────────────────────────────────────────────
function abrirModalExcluir() {
  let modal = document.getElementById("modalExcluirConta");
  if (!modal) {
    modal = criarModalExcluirHTML();
    document.body.appendChild(modal);
    attachExcluirListeners();
  }

  // Limpa campos ao reabrir
  const inputSenha = document.getElementById("inputSenhaExcluir");
  const inputEmail = document.getElementById("inputConfirmarEmail");
  if (inputSenha) inputSenha.value = "";
  if (inputEmail) inputEmail.value = "";
  const btnExcluir = document.getElementById("btnConfirmarExcluir");
  if (btnExcluir) btnExcluir.disabled = true;

  setTimeout(() => modal.classList.add("active"), 10);
}

// ── API Pública ──────────────────────────────────────────────────
/**
 * Inicializa o módulo de exclusão de conta.
 * @param {Object} user — objeto do Firebase Auth
 */
export function initExcluirConta(user) {
  if (!user) return;
  _user = user;
  ensureCSS();
}

/**
 * Abre o modal de exclusão de conta.
 */
export function abrirExcluir() {
  abrirModalExcluir();
}
