import { db } from "../db/firebase.js";
import { doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const AVATARES = ["🦊", "🚀", "👽", "🤠", "🤖", "🦄", "🐶", "🐱", "🐸", "😎", "🤓", "👻"];

let userUid = null;
let userDocData = null;

export async function initPerfil(user) {
  if (!user) return;
  userUid = user.uid;

  if (!document.getElementById("perfilCss")) {
    const link = document.createElement("link");
    link.id = "perfilCss";
    link.rel = "stylesheet";
    link.href = "../utils/perfil.css";
    document.head.appendChild(link);
  }

  const userRef = doc(db, "usuarios", userUid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    userDocData = snap.data();
    // Garante que o email sempre está no Firestore (necessário para o ranking)
    const updates = {};
    if (!userDocData.email) updates.email = user.email;
    if (!userDocData.displayName && user.displayName) updates.displayName = user.displayName;
    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates);
      userDocData = { ...userDocData, ...updates };
    }
  } else {
    // Documento novo: salva email + displayName para o ranking poder usar
    userDocData = {
      email: user.email,
      displayName: user.displayName || "",
    };
    await setDoc(userRef, userDocData);
  }

  // Nome de exibição: prioridade nome > displayName > parte do email
  const nomeExibicao = userDocData.nome || user.displayName || user.email.split("@")[0];
  const fotoUrl = userDocData.fotoUrl || null;
  const avatarEmoji = userDocData.avatar || user.email[0].toUpperCase();
  const streakAtual = userDocData.currentStreak || 0;

  // ── Atualiza topbar ──────────────────────────────────────────
  const elAvatar = document.getElementById("avatar");
  if (elAvatar) {
    if (fotoUrl) {
      elAvatar.innerHTML = `<img src="${fotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`;
    } else {
      elAvatar.innerHTML = "";
      elAvatar.textContent = avatarEmoji;
    }
  }

  const elEmail = document.getElementById("userEmail");
  if (elEmail) elEmail.textContent = nomeExibicao;

  // Streak badge
  const userChip = document.querySelector(".user-chip");
  if (userChip && !document.getElementById("navStreak")) {
    const streakBadge = document.createElement("div");
    streakBadge.id = "navStreak";
    streakBadge.className = "streak-badge";
    streakBadge.style.marginLeft = "10px";
    streakBadge.innerHTML = `🔥 ${streakAtual}`;
    userChip.parentNode.insertBefore(streakBadge, userChip.nextSibling);
  }

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

  const nomeExibicao = userDocData.nome || user.displayName || user.email.split("@")[0];
  const fotoUrl = userDocData.fotoUrl || null;
  const avatarAtual = userDocData.avatar || user.email[0].toUpperCase();

  const previewEl = document.getElementById("perfilPreviewAvatar");
  if (previewEl) {
    if (fotoUrl) {
      previewEl.innerHTML = `<img src="${fotoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="">`;
    } else {
      previewEl.innerHTML = "";
      previewEl.textContent = avatarAtual;
    }
  }

  document.getElementById("perfilPreviewEmail").textContent = nomeExibicao;
  document.getElementById("perfilStreakNum").textContent = userDocData.currentStreak || 0;

  // Grid de avatares emoji
  const grid = document.getElementById("perfilEmojiGrid");
  grid.innerHTML = "";
  AVATARES.forEach(emoji => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn";
    if (emoji === avatarAtual && !fotoUrl) btn.classList.add("selected");
    btn.textContent = emoji;
    btn.onclick = async () => {
      document.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");

      const prev = document.getElementById("perfilPreviewAvatar");
      if (prev) { prev.innerHTML = ""; prev.textContent = emoji; }

      const userRef = doc(db, "usuarios", userUid);
      await updateDoc(userRef, { avatar: emoji, fotoUrl: null });
      userDocData.avatar = emoji;
      userDocData.fotoUrl = null;

      const navAvatar = document.getElementById("avatar");
      if (navAvatar) { navAvatar.innerHTML = ""; navAvatar.textContent = emoji; }
    };
    grid.appendChild(btn);
  });

  // Badges
  const badgesGrid = document.getElementById("perfilBadgesGrid");
  badgesGrid.innerHTML = "";
  const badgesDisponiveis = [
    { id: "primeiro_passo", icon: "🌱", nome: "Iniciante" },
    { id: "fogo_3_dias", icon: "🔥", nome: "3 Dias" },
    { id: "maquina_xp", icon: "⚡", nome: "Máquina" },
  ];
  const minhasBadges = userDocData.badges || [];
  badgesDisponiveis.forEach(b => {
    const hasBadge = minhasBadges.includes(b.id);
    const div = document.createElement("div");
    div.className = "badge-item" + (hasBadge ? " unlocked" : "");
    div.innerHTML = `<div class="badge-icon">${b.icon}</div><div class="badge-name">${b.nome}</div>`;
    badgesGrid.appendChild(div);
  });

  setTimeout(() => modal.classList.add("active"), 10);
}

function criarModalHtml() {
  const overlay = document.createElement("div");
  overlay.id = "modalPerfil";
  overlay.className = "modal-perfil-overlay";

  overlay.innerHTML = `
    <div class="modal-perfil-box" onclick="event.stopPropagation()">
      <button class="btn-close-perfil"
        onclick="document.getElementById('modalPerfil').classList.remove('active')">✕</button>

      <div class="perfil-header">
        <div class="perfil-avatar-preview" id="perfilPreviewAvatar">?</div>
        <div class="perfil-email" id="perfilPreviewEmail">...</div>
        <div class="streak-badge" style="font-size:1rem;">
          <span id="perfilStreakNum">0</span> 🔥 Dias Seguidos
        </div>
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