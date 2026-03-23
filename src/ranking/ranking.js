import { auth } from "../db/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db } from "../db/firebase.js";
import {
  collection, getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initTheme, toggleTheme, updateToggleIcon } from "../utils/theme.js";

// Tema
initTheme();
const btnTheme = document.getElementById("btnTheme");
updateToggleIcon(btnTheme);
btnTheme.addEventListener("click", () => { toggleTheme(); updateToggleIcon(btnTheme); });

let myUid = null;
let rankingGlobal = [];
let sortAsc = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../login/login.html"; return; }
  myUid = user.uid;
  await carregarRanking();
});

/**
 * Busca todos os usuários, calcula XP (acertos totais) por usuário
 * lendo a subcoleção usuarios/{uid}/materias/{mid}/licoes
 */
async function carregarRanking() {
  try {
    const usuariosSnap = await getDocs(collection(db, "usuarios"));

    const ranking = [];

    await Promise.all(usuariosSnap.docs.map(async (userDoc) => {
      const uid   = userDoc.id;
      const data  = userDoc.data();
      const email = data.email || uid;
      const avatar = data.avatar || email[0].toUpperCase();
      const badges = data.badges || [];

      let totalAcertos = 0;
      let totalLicoes  = 0;

      // Busca todas as matérias do usuário
      const materiasSnap = await getDocs(
        collection(db, "usuarios", uid, "materias")
      ).catch(() => ({ docs: [] }));

      await Promise.all(materiasSnap.docs.map(async (matDoc) => {
        const licoesSnap = await getDocs(
          collection(db, "usuarios", uid, "materias", matDoc.id, "licoes")
        ).catch(() => ({ docs: [] }));

        licoesSnap.docs.forEach(licDoc => {
          const l = licDoc.data();
          if (l.concluida) {
            totalAcertos += (l.acertos ?? 0);
            totalLicoes++;
          }
        });
      }));

      if (totalLicoes > 0) {
        ranking.push({ uid, email, avatar, badges, xp: totalAcertos, licoes: totalLicoes });
      }
    }));

    // Ordena do maior XP para o menor
    ranking.sort((a, b) => b.xp - a.xp);
    rankingGlobal = ranking;

    let totalXp = 0;
    let totalLic = 0;
    ranking.forEach(r => { totalXp += r.xp; totalLic += r.licoes; });
    document.getElementById("totalCommunityXp").textContent = totalXp + " XP";
    document.getElementById("totalCommunityLicoes").textContent = totalLic;

    renderPodium(rankingGlobal);
    renderLista(rankingGlobal);
    renderMyRank(rankingGlobal);

    // Setup events
    const searchInput = document.getElementById("searchRank");
    if(searchInput) {
      searchInput.addEventListener("input", (e) => {
        aplicarFiltros();
      });
    }

    const btnSort = document.getElementById("btnSort");
    if(btnSort) {
      btnSort.addEventListener("click", () => {
        sortAsc = !sortAsc;
        btnSort.style.transform = sortAsc ? "scaleY(-1)" : "scaleY(1)";
        aplicarFiltros();
      });
    }

  } catch (e) {
    console.error("Erro ao carregar ranking:", e);
    document.getElementById("skeletons").innerHTML =
      `<p style="color:var(--error);text-align:center;padding:1rem">Erro ao carregar ranking.</p>`;
  }
}

function renderPodium(ranking) {
  // Garante que o pódio sempre terá 3 lugares, preenchendo com "Vazio" se não houver usuários suficientes
  const top3 = [];
  for (let i = 0; i < 3; i++) {
    if (ranking[i]) {
      top3.push(ranking[i]);
    } else {
      top3.push({ avatar: "?", email: "Ainda Vazio", xp: 0 });
    }
  }

  // Ordem visual: 2º, 1º, 3º
  const order = [top3[1], top3[0], top3[2]];
  const blocks = ["p2", "p1", "p3"];
  const medals = ["🥈", "🥇", "🥉"];
  const colors = ["#9ca3af", "#f59e0b", "#b45309"];

  const wrap = document.getElementById("podiumWrap");
  wrap.innerHTML = "";

  order.forEach((u, i) => {
    const blockClass = blocks[i];
    const medal = medals[i];
    const color = colors[i];

    const isEmpty = u.email === "Ainda Vazio";
    const opacityStyle = isEmpty ? "opacity: 0.6; filter: grayscale(1);" : "";
    const avatarBg = isEmpty ? "rgba(255,255,255,0.1)" : color;

    const div = document.createElement("div");
    div.className = "podium-item";
    if (opacityStyle) {
      div.style.cssText = opacityStyle;
    }
    div.innerHTML = `
      <div class="podium-avatar" style="background:${avatarBg}">${u.avatar}</div>
      <div class="podium-name">${u.email.split("@")[0]}</div>
      <div class="podium-xp" style="${isEmpty ? 'visibility:hidden;' : ''}">${u.xp} XP</div>
      <div class="podium-block ${blockClass}">${medal}</div>
    `;
    wrap.appendChild(div);
  });
}

function renderLista(rankingListFiltered) {
  const skeletons = document.getElementById("skeletons");
  const list = document.getElementById("rankingList");
  const empty = document.getElementById("emptyState");
  const sub = document.getElementById("rankingSub");

  skeletons.style.display = "none";
  list.innerHTML = ""; // Limpa a lista antes de renderizar para não duplicar

  if (rankingListFiltered.length === 0) {
    empty.classList.remove("hidden");
    sub.textContent = "0 usuários";
    return;
  }

  sub.textContent = `${rankingListFiltered.length} estudante${rankingListFiltered.length !== 1 ? "s" : ""} encontrado${rankingListFiltered.length !== 1 ? "s" : ""}`;

  const posClasses = ["gold", "silver", "bronze"];

  rankingListFiltered.forEach((u, i) => {
    // Calculo da posição real global se estiver ordenado normal
    const originalIndex = rankingGlobal.findIndex(ro => ro.uid === u.uid);
    const pos = originalIndex + 1;
    
    const row = document.createElement("div");
    row.className = "rank-row" + (u.uid === myUid ? " me" : "");

    const posClass = pos <= 3 ? posClasses[pos - 1] : "";
    const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `#${pos}`;

    let badgesStr = "";
    if(u.badges && u.badges.length > 0) {
       badgesStr = u.badges.map(b => {
          if(b === "primeiro_passo") return "🌱";
          if(b === "fogo_3_dias") return "🔥";
          if(b === "maquina_xp") return "⚡";
          return "";
       }).join("");
    }

    row.innerHTML = `
      <div class="rank-pos ${posClass}">${medal}</div>
      <div class="rank-avatar">${u.avatar}</div>
      <div class="rank-info">
        <div class="rank-email">${u.email} <span style="font-size:0.85rem; margin-left: 6px; letter-spacing:2px;">${badgesStr}</span></div>
        <div class="rank-detail">${u.licoes} lição${u.licoes !== 1 ? "ões" : ""} concluída${u.licoes !== 1 ? "s" : ""}</div>
      </div>
      <div class="rank-xp">${u.xp}<span>XP</span></div>
    `;
    list.appendChild(row);
  });
}

function aplicarFiltros() {
  const termo = document.getElementById("searchRank").value.toLowerCase();
  let filtrado = rankingGlobal.filter(u => u.email.toLowerCase().includes(termo));
  
  if (sortAsc) {
      filtrado.sort((a, b) => a.xp - b.xp);
  } else {
      filtrado.sort((a, b) => b.xp - a.xp);
  }
  
  renderLista(filtrado);
}

function renderMyRank(ranking) {
  const myIdx = ranking.findIndex(u => u.uid === myUid);
  if (myIdx === -1) return;

  const card = document.getElementById("myRankCard");
  card.classList.remove("hidden");
  document.getElementById("myRankVal").textContent = `#${myIdx + 1}`;
  document.getElementById("myXpVal").textContent   = `${ranking[myIdx].xp} XP`;
}
