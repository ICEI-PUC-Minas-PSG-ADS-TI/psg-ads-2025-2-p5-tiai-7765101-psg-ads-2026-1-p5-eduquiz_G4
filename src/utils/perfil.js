import { db } from "../db/firebase.js";
import { doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const AVATARES = ["🦊", "🚀", "👽", "🤠", "🤖", "🦄", "🐶", "🐱", "🐸", "😎", "🤓", "👻"];

let userUid = null;
let userDocData = null;

/**
 * Inicializa os dados do perfil na navbar e prepara o clique para abrir o modal.
 * @param {Object} user O objeto user retornado pelo onAuthStateChanged
 */
export async function initPerfil(user) {
  if (!user) return;
  userUid = user.uid;

  // Carrega CSS se ainda não estiver carregado
  if (!document.getElementById("perfilCss")) {
    const link = document.createElement("link");
    link.id = "perfilCss";
    link.rel = "stylesheet";
    link.href = "../utils/perfil.css";
    document.head.appendChild(link);
  }

  // Busca dados do usuário (avatar, streak, badges)
  const userRef = doc(db, "usuarios", userUid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    userDocData = snap.data();
  } else {
    userDocData = { email: user.email };
    await setDoc(userRef, userDocData);
  }

  const avatarAtual = userDocData.avatar || user.email[0].toUpperCase();
  const streakAtual = userDocData.currentStreak || 0;

  // Atualiza navbars
  const elAvatar = document.getElementById("avatar");
  if (elAvatar) elAvatar.textContent = avatarAtual;
  
  const elEmail = document.getElementById("userEmail");
  if (elEmail) elEmail.textContent = user.email.split("@")[0];

  // Injeta o Streak Badge dinamicamente na navbar (se não existir ainda)
  const userChip = document.querySelector(".user-chip");
  if (userChip && !document.getElementById("navStreak")) {
    const streakBadge = document.createElement("div");
    streakBadge.id = "navStreak";
    streakBadge.className = "streak-badge";
    streakBadge.style.marginLeft = "10px";
    streakBadge.innerHTML = `🔥 ${streakAtual}`;
    userChip.parentNode.insertBefore(streakBadge, userChip.nextSibling);
  }

  // Clique no user-chip abre o Modal
  if (userChip) {
    userChip.style.cursor = "pointer";
    userChip.title = "Editar Perfil";
    userChip.onclick = () => abrirModalPerfil(user);
  }
}

function abrirModalPerfil(user) {
  let modal = document.getElementById("modalPerfil");
  if (!modal) {
    modal = criarModalHtml();
    document.body.appendChild(modal);
  }

  // Preenche dados
  const avatarAtual = userDocData.avatar || user.email[0].toUpperCase();
  document.getElementById("perfilPreviewAvatar").textContent = avatarAtual;
  document.getElementById("perfilPreviewEmail").textContent = user.email;
  document.getElementById("perfilStreakNum").textContent = userDocData.currentStreak || 0;

  // Renderiza Grid de Avatares
  const grid = document.getElementById("perfilEmojiGrid");
  grid.innerHTML = "";
  AVATARES.forEach(emoji => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn";
    if (emoji === avatarAtual) btn.classList.add("selected");
    btn.textContent = emoji;
    btn.onclick = async () => {
      document.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById("perfilPreviewAvatar").textContent = emoji;
      
      // Salva no Firestore
      const userRef = doc(db, "usuarios", userUid);
      await updateDoc(userRef, { avatar: emoji });
      userDocData.avatar = emoji;
      
      // Atualiza navbar imediatamente
      const navAvatar = document.getElementById("avatar");
      if (navAvatar) navAvatar.textContent = emoji;
    };
    grid.appendChild(btn);
  });

  // Renderiza Badges
  const badgesGrid = document.getElementById("perfilBadgesGrid");
  badgesGrid.innerHTML = "";
  const badgesDisponiveis = [
    { id: "primeiro_passo", icon: "🌱", nome: "Iniciante" },
    { id: "fogo_3_dias", icon: "🔥", nome: "3 Dias" },
    { id: "maquina_xp", icon: "⚡", nome: "Máquina" }
  ];
  const minhasBadges = userDocData.badges || [];
  
  badgesDisponiveis.forEach(b => {
    const hasBadge = minhasBadges.includes(b.id);
    const div = document.createElement("div");
    div.className = "badge-item" + (hasBadge ? " unlocked" : "");
    div.innerHTML = `<div class="badge-icon">${b.icon}</div><div class="badge-name">${b.nome}</div>`;
    badgesGrid.appendChild(div);
  });

  // Abre animado
  setTimeout(() => modal.classList.add("active"), 10);
}

function criarModalHtml() {
  const overlay = document.createElement("div");
  overlay.id = "modalPerfil";
  overlay.className = "modal-perfil-overlay";
  
  overlay.innerHTML = `
    <div class="modal-perfil-box" onclick="event.stopPropagation()">
      <button class="btn-close-perfil" onclick="document.getElementById('modalPerfil').classList.remove('active')">✕</button>
      
      <div class="perfil-header">
        <div class="perfil-avatar-preview" id="perfilPreviewAvatar">?</div>
        <div class="perfil-email" id="perfilPreviewEmail">...</div>
        <div class="streak-badge" style="font-size: 1rem;"><span id="perfilStreakNum">0</span> 🔥 Dias Seguidos</div>
      </div>

      <div class="perfil-section">
        <div class="perfil-section-title">🎨 Escolha seu Avatar</div>
        <div class="emoji-grid" id="perfilEmojiGrid"></div>
      </div>

      <div class="perfil-section">
        <div class="perfil-section-title">🎖️ Suas Conquistas</div>
        <div class="badges-grid" id="perfilBadgesGrid"></div>
      </div>

    </div>
  `;

  overlay.onclick = () => overlay.classList.remove("active");
  return overlay;
}
