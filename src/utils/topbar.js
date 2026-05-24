/**
 * topbar.js — Topbar + Sidebar compartilhados entre todas as páginas do EduQuiz
 *
 * Injeta dinamicamente:
 *  - A topbar completa (logo, stat chips, user-chip com dropdown, botão logout)
 *  - A sidebar de navegação com item ativo detectado automaticamente pela URL
 *  - Os orbs de background animados
 *
 * Uso em qualquer página:
 *   import { initTopbar } from "../utils/topbar.js";
 *   // dentro do onAuthStateChanged:
 *   await initTopbar(user, { paginaAtiva: "historico" });
 *
 * Páginas válidas para paginaAtiva:
 *   "dashboard" | "materias" | "ranking" | "historico" | "perfil"
 */

import { auth } from "../db/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getUserStats } from "../db/progresso.js";
import { initUserMenu } from "./userMenu.js";

// ── CSS da topbar/sidebar injetado dinamicamente ─────────────────
const TOPBAR_SHARED_CSS = `
/* ── ORBS ── */
.orb {
  position: fixed; border-radius: 50%; filter: blur(80px);
  pointer-events: none; animation: orbFloat 8s ease-in-out infinite; z-index: 0;
}
.orb-1 { width: 400px; height: 400px; background: rgba(255,255,255,0.12); top: 5%; left: -8%; }
.orb-2 { width: 300px; height: 300px; background: rgba(123,211,255,0.2); bottom: 10%; right: -5%; animation-delay: 3s; }
.orb-3 { width: 250px; height: 250px; background: rgba(95,124,255,0.15); top: 50%; left: 30%; animation-delay: 1.5s; }
@keyframes orbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }

/* ── TOPBAR ── */
.topbar {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 68px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.35);
}
html.dark .topbar {
  background: rgba(15,15,35,0.5);
  border-bottom-color: rgba(95,124,255,0.2);
}
.topbar-logo {
  font-size: 1.4rem; font-weight: 900; color: #fff;
  letter-spacing: -0.5px; text-shadow: 0 2px 8px rgba(0,0,0,0.15);
  text-decoration: none; cursor: pointer; flex-shrink: 0;
}
.topbar-logo span { opacity: 0.65; }
.topbar-center { display: flex; align-items: center; gap: 0.75rem; }
.stat-chip {
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.4);
  border-radius: 12px; padding: 6px 18px;
  backdrop-filter: blur(10px); transition: all .2s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08); cursor: default;
}
.stat-chip:hover { background: rgba(255,255,255,0.32); transform: translateY(-1px); }
.stat-chip-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.7); letter-spacing:.05em; }
.stat-chip-val { font-size: 18px; font-weight: 900; color: #fff; }
.topbar-right { display: flex; align-items: center; gap: 10px; position: relative; }
.user-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.22); border: 1px solid rgba(255,255,255,0.4);
  border-radius: 20px; padding: 6px 14px;
  font-size: 14px; font-weight: 700; color: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  cursor: pointer; transition: background 0.2s;
  user-select: none;
}
.user-chip:hover { background: rgba(255,255,255,0.32); }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 13px; color: #fff; flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.4); overflow: hidden;
}
.btn-logout {
  background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35);
  color: #fff; padding: 8px 16px; border-radius: 10px;
  font-family: inherit; font-weight: 700; font-size: 13px;
  cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 6px;
}
.btn-logout:hover { background: rgba(255,255,255,0.32); transform: translateY(-1px); }

/* ── LAYOUT RAIZ ── */
.page-layout {
  display: flex; min-height: calc(100vh - 68px); position: relative; z-index: 1;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 220px; padding: 28px 14px;
  display: flex; flex-direction: column; gap: 4px;
  border-right: 1px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
  background: rgba(0,0,0,0.12);
  backdrop-filter: blur(8px);
  position: sticky; top: 68px; height: calc(100vh - 68px);
  overflow-y: auto;
}
.sidebar-label {
  font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .1em; color: rgba(255,255,255,0.45);
  padding: 0 10px; margin-bottom: 10px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 12px;
  font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.65);
  cursor: pointer; transition: all .2s; background: none; border: none;
  font-family: inherit; width: 100%; text-align: left; text-decoration: none;
}
.nav-item:hover { background: rgba(255,255,255,0.15); color: #fff; transform: translateX(2px); }
.nav-item.active {
  background: rgba(255,255,255,0.25); color: #fff;
  border: 1px solid rgba(255,255,255,0.4);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.nav-item svg { flex-shrink: 0; opacity: 0.85; }

/* ── CONTEÚDO PRINCIPAL ── */
.page-main {
  flex: 1; overflow-y: auto; position: relative;
}

/* ── RESPONSIVO ── */
@media (max-width: 768px) {
  .topbar { padding: 0 1rem; }
  .topbar-center { display: none; }
  .page-layout { flex-direction: column; }
  .sidebar {
    width: 100%; height: auto; position: static;
    border-right: none; border-bottom: 1px solid rgba(255,255,255,0.12);
    flex-direction: row; flex-wrap: wrap; justify-content: center;
    padding: 10px 12px; gap: 6px;
    background: rgba(0,0,0,0.08);
  }
  .sidebar-label { display: none; }
  .nav-item { width: auto; padding: 8px 12px; font-size: 13px; }
  .nav-item span.nav-label { display: none; }
  .topbar-logo { font-size: 1.15rem; }
  .btn-logout span { display: none; }
  .btn-logout { padding: 8px 10px; }
}
`;

// ── SVGs dos ícones de navegação ─────────────────────────────────
const NAV_ICONS = {
  dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  materias:  `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  ranking:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 20 18 10"/><polyline points="12 20 12 4"/><polyline points="6 20 6 14"/></svg>`,
  historico: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  perfil:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
};

// URLs relativas para cada página (base = pasta da página atual)
const NAV_URLS = {
  dashboard: "../dashboard/dashboard.html",
  materias:  "../materias/materias.html",
  ranking:   "../ranking/ranking.html",
  historico: "../historico/historico.html",
  perfil:    "../admin/admin.html",
};

const NAV_LABELS = {
  dashboard: "Início",
  materias:  "Trilhas",
  ranking:   "Ranking",
  historico: "Histórico",
  perfil:    "Perfil",
};

// ── Injeta CSS ────────────────────────────────────────────────────
function ensureCSS() {
  if (document.getElementById("topbarSharedCss")) return;
  const style = document.createElement("style");
  style.id = "topbarSharedCss";
  style.textContent = TOPBAR_SHARED_CSS;
  document.head.appendChild(style);
}

// ── Injeta orbs se não existirem ──────────────────────────────────
function ensureOrbs() {
  if (document.querySelector(".orb")) return;
  [1, 2, 3].forEach(n => {
    const d = document.createElement("div");
    d.className = `orb orb-${n}`;
    document.body.prepend(d);
  });
}

// ── Constrói HTML da topbar ───────────────────────────────────────
function buildTopbarHTML(user) {
  const inicial = (user.email || "?")[0].toUpperCase();
  return `
    <a class="topbar-logo" href="../dashboard/dashboard.html">🎓 Edu<span>Quiz</span></a>

    <div class="topbar-center">
      <div class="stat-chip">
        <span class="stat-chip-label">🔥 Sequência</span>
        <span class="stat-chip-val" id="statSequencia">— dias</span>
      </div>
      <div class="stat-chip">
        <span class="stat-chip-label">🏅 Nível</span>
        <span class="stat-chip-val" id="statNivel">—</span>
      </div>
    </div>

    <div class="topbar-right">
      <div class="user-chip">
        <div class="avatar" id="avatar">${inicial}</div>
        <span id="userEmail">${user.email.split("@")[0]}</span>
      </div>
      <button class="btn-logout" id="btnLogout">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Sair</span>
      </button>
    </div>
  `;
}

// ── Constrói HTML da sidebar ──────────────────────────────────────
function buildSidebarHTML(paginaAtiva) {
  const itens = ["dashboard", "materias", "ranking", "historico", "perfil"];
  const linhas = itens.map(id => `
    <button
      class="nav-item${paginaAtiva === id ? " active" : ""}"
      data-nav="${id}"
    >
      ${NAV_ICONS[id]}
      <span class="nav-label">${NAV_LABELS[id]}</span>
    </button>
  `).join("");

  return `<p class="sidebar-label">Navegação</p>${linhas}`;
}

// ── Carrega stats e preenche chips ────────────────────────────────
async function carregarStats(uid) {
  try {
    const s = await getUserStats(uid);
    const elSeq = document.getElementById("statSequencia");
    const elNivel = document.getElementById("statNivel");
    if (elSeq)   elSeq.textContent   = (s.sequencia ?? 0) + " dias";
    if (elNivel) elNivel.textContent = s.nivel ?? 1;
  } catch (_) {
    const elSeq = document.getElementById("statSequencia");
    const elNivel = document.getElementById("statNivel");
    if (elSeq)   elSeq.textContent   = "0 dias";
    if (elNivel) elNivel.textContent = "1";
  }
}

// ── API PÚBLICA ───────────────────────────────────────────────────
/**
 * Injeta a topbar e a sidebar compartilhadas na página.
 *
 * @param {Object} user          Firebase Auth user
 * @param {Object} opts
 * @param {string} opts.paginaAtiva  "dashboard"|"materias"|"ranking"|"historico"|"perfil"
 * @param {HTMLElement} [opts.mainEl]  Elemento que será o conteúdo principal (padrão: <main> ou body)
 */
export async function initTopbar(user, opts = {}) {
  if (!user) return;

  const paginaAtiva = opts.paginaAtiva ?? detectarPaginaAtiva();

  ensureCSS();
  ensureOrbs();

  // ── 1. Topbar ──────────────────────────────────────────────────
  let topbar = document.querySelector("header.topbar");
  if (!topbar) {
    topbar = document.createElement("header");
    topbar.className = "topbar";
    document.body.prepend(topbar);
  }
  topbar.innerHTML = buildTopbarHTML(user);

  // ── 2. Logout ──────────────────────────────────────────────────
  document.getElementById("btnLogout")?.addEventListener("click", async () => {
    try { await signOut(auth); } catch (_) {}
    window.location.href = "../login/login.html";
  });

  // ── 3. User menu (dropdown) ────────────────────────────────────
  await initUserMenu(user);

  // ── 4. Stats assíncrono (não bloqueia render) ──────────────────
  carregarStats(user.uid);

  // ── 5. Sidebar + layout ────────────────────────────────────────
  // Pega o conteúdo principal existente antes de remodelar o DOM
  const mainEl = opts.mainEl
    ?? document.querySelector("main")
    ?? document.querySelector(".main-content")
    ?? document.querySelector(".main");

  // Cria wrapper de layout se ainda não existe
  let layout = document.querySelector(".page-layout");
  if (!layout) {
    layout = document.createElement("div");
    layout.className = "page-layout";

    // Move o conteúdo principal para dentro do layout
    if (mainEl) {
      mainEl.parentNode.insertBefore(layout, mainEl);
      // Preserva classes existentes, adiciona page-main
      mainEl.classList.add("page-main");
      layout.appendChild(mainEl);
    } else {
      document.body.appendChild(layout);
    }
  }

  // Injeta sidebar antes do main
  let sidebar = layout.querySelector(".sidebar");
  if (!sidebar) {
    sidebar = document.createElement("aside");
    sidebar.className = "sidebar";
    layout.insertBefore(sidebar, layout.firstChild);
  }
  sidebar.innerHTML = buildSidebarHTML(paginaAtiva);

  // ── 6. Navegação pelos botões da sidebar ───────────────────────
  sidebar.querySelectorAll(".nav-item[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => {
      const destino = btn.dataset.nav;
      if (destino && NAV_URLS[destino]) {
        window.location.href = NAV_URLS[destino];
      }
    });
  });
}

// ── Detecta página ativa pela URL ─────────────────────────────────
function detectarPaginaAtiva() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("dashboard")) return "dashboard";
  if (path.includes("materia"))   return "materias";
  if (path.includes("ranking"))   return "ranking";
  if (path.includes("historico")) return "historico";
  if (path.includes("admin") || path.includes("perfil")) return "perfil";
  return "dashboard";
}
