/**
 * userMenu.js — Menu dropdown exibido ao clicar no user-chip da topbar
 *
 * Opções:
 *  - Ver Perfil (avatar/gamificação — perfil.js original)
 *  - Mudar Dados (editarConta.js)
 *  - Excluir Conta (excluirConta.js)
 *
 * Uso:
 *   import { initUserMenu } from "../utils/userMenu.js";
 *   initUserMenu(user);
 *
 * Compatível com o design system global (global.css / dashboard.css).
 */

import { initPerfil }       from "./perfil.js";
import { initEditarConta, abrirEditar } from "./editarConta.js";
import { initExcluirConta, abrirExcluir } from "./excluirConta.js";

// ── CSS do menu ──────────────────────────────────────────────────
const MENU_CSS = `
#userDropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 220px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: 0 16px 48px rgba(0,0,0,0.22);
  border-radius: 16px;
  padding: 0.6rem;
  z-index: 9998;
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
#userDropdown.open {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.user-dropdown-email {
  padding: 0.6rem 0.75rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.4rem;
  word-break: break-all;
}
.user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  background: none;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.user-dropdown-item:hover {
  background: var(--accent-light);
  color: var(--accent);
}
.user-dropdown-item.danger {
  color: var(--error);
}
.user-dropdown-item.danger:hover {
  background: rgba(239,68,68,0.08);
  color: var(--error);
}
.user-dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 0.4rem 0;
}
.user-chip-wrap {
  position: relative;
}
`;

// ── Injeta o CSS do menu no <head> ───────────────────────────────
function ensureMenuCSS() {
  if (document.getElementById("userMenuCss")) return;
  const style = document.createElement("style");
  style.id = "userMenuCss";
  style.textContent = MENU_CSS;
  document.head.appendChild(style);
}

// ── Cria o dropdown DOM ──────────────────────────────────────────
function criarDropdown(user) {
  const dropdown = document.createElement("div");
  dropdown.id = "userDropdown";
  dropdown.setAttribute("role", "menu");
  dropdown.setAttribute("aria-label", "Menu do usuário");

  dropdown.innerHTML = `
    <div class="user-dropdown-email">${user.email}</div>

    <button class="user-dropdown-item" id="menuItemPerfil" role="menuitem">
      🎖️ Ver Perfil &amp; Conquistas
    </button>

    <button class="user-dropdown-item" id="menuItemEditar" role="menuitem">
      ✏️ Mudar Dados
    </button>

    <div class="user-dropdown-divider"></div>

    <button class="user-dropdown-item danger" id="menuItemExcluir" role="menuitem">
      🗑️ Excluir Conta
    </button>
  `;

  return dropdown;
}

// ── Abre/fecha o dropdown ────────────────────────────────────────
let _dropdownAberto = false;

function toggleDropdown() {
  const dropdown = document.getElementById("userDropdown");
  if (!dropdown) return;
  _dropdownAberto = !_dropdownAberto;
  dropdown.classList.toggle("open", _dropdownAberto);
}

function fecharDropdown() {
  const dropdown = document.getElementById("userDropdown");
  if (dropdown) dropdown.classList.remove("open");
  _dropdownAberto = false;
}

// ── API Pública ──────────────────────────────────────────────────
/**
 * Inicializa o menu de usuário na topbar.
 * Substitui o comportamento padrão do user-chip (que abria só o perfil)
 * por um dropdown com múltiplas opções.
 *
 * @param {Object} user — objeto Firebase Auth (onAuthStateChanged)
 */
export async function initUserMenu(user) {
  if (!user) return;

  ensureMenuCSS();

  // Inicializa módulos filhos
  await initPerfil(user);
  await initEditarConta(user);
  initExcluirConta(user);

  // Busca o user-chip existente e envolve num wrapper relativo
  const chip = document.querySelector(".user-chip");
  if (!chip) return;

  // Cria wrapper relativo (para posicionar o dropdown)
  let wrap = document.getElementById("userChipWrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "userChipWrap";
    wrap.className = "user-chip-wrap";
    chip.parentNode.insertBefore(wrap, chip);
    wrap.appendChild(chip);
  }

  // Injeta dropdown no wrapper
  if (!document.getElementById("userDropdown")) {
    const dropdown = criarDropdown(user);
    wrap.appendChild(dropdown);
  }

  // Remove onclick antigo do perfil.js e aplica o novo
  chip.style.cursor = "pointer";
  chip.title = "Menu do usuário";
  chip.onclick = (e) => {
    e.stopPropagation();
    toggleDropdown();
  };

  // Clique fora fecha
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) fecharDropdown();
  });

  // Escape fecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharDropdown();
  });

  // Listeners dos itens
  document.getElementById("menuItemPerfil")?.addEventListener("click", () => {
    fecharDropdown();
    // Re-abre o modal de perfil original do perfil.js
    const overlay = document.getElementById("modalPerfil");
    if (overlay) {
      setTimeout(() => overlay.classList.add("active"), 10);
    } else {
      // Força abertura via clique programático (perfil.js usa onclick do chip internamente)
      chip.dispatchEvent(new MouseEvent("dblclick"));
    }
  });

  document.getElementById("menuItemEditar")?.addEventListener("click", () => {
    fecharDropdown();
    abrirEditar();
  });

  document.getElementById("menuItemExcluir")?.addEventListener("click", () => {
    fecharDropdown();
    abrirExcluir();
  });
}
