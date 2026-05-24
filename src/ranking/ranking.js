import { auth } from "../db/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db } from "../db/firebase.js";
import {
  collection, getDocs, doc, getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { initUserMenu } from "../utils/userMenu.js";

document.getElementById("btnLogout")?.addEventListener("click", async () => {
  const { signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  await signOut(auth);
  window.location.href = "../login/login.html";
});

let myUid = null;
let rankingGlobal = [];
let sortAsc = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "../login/login.html"; return; }
  myUid = user.uid;

  await initUserMenu(user);

  try {
    const { getUserStats } = await import("../db/progresso.js");
    const s = await getUserStats(user.uid).catch(() => null);
    if (s) {
      const elSeq = document.getElementById("statSequencia");
      const elNiv = document.getElementById("statNivel");
      if (elSeq) elSeq.textContent = (s.sequencia ?? 0) + " dias";
      if (elNiv) elNiv.textContent = s.nivel ?? 1;
    }
  } catch (e) { }

  await carregarRanking();
});

async function getCatalogo() {
  try {
    const snap = await getDoc(doc(db, "config", "materias"));
    if (snap.exists()) return snap.data().lista ?? [];
  } catch (e) { }
  return [
    { id: "portugues" }, { id: "matematica" }, { id: "historia" },
    { id: "geografia" }, { id: "ciencias" }, { id: "ingles" },
    { id: "fisica" }, { id: "quimica" }, { id: "biologia" },
    { id: "artes" }, { id: "educacao_fisica" }, { id: "filosofia" }, { id: "sociologia" },
  ];
}

async function calcularXpUsuario(uid, catalogoMaterias) {
  let totalXp = 0;
  let totalLicoes = 0;
  await Promise.all(catalogoMaterias.map(async (mat) => {
    try {
      const licoesSnap = await getDocs(
        collection(db, "usuarios", uid, "materias", mat.id, "licoes")
      );
      licoesSnap.docs.forEach(licDoc => {
        const l = licDoc.data();
        if (l.concluida) {
          totalXp += (l.xp && l.xp > 0) ? l.xp : ((l.acertos || 0) * 20);
          totalLicoes++;
        }
      });
    } catch (_) { }
  }));
  return { totalXp, totalLicoes };
}

// ── Resolve o melhor nome de exibição para qualquer usuário ───────
// Prioridade: nome salvo > displayName > parte antes do @ do email > uid truncado
function resolverNome(data, uid) {
  if (data.nome && data.nome.trim()) return data.nome.trim();
  if (data.displayName && data.displayName.trim()) return data.displayName.trim();
  if (data.email && data.email.includes("@")) return data.email.split("@")[0];
  if (data.email) return data.email;
  return uid.slice(0, 8);
}

async function carregarRanking() {
  try {
    const catalogoMaterias = await getCatalogo();
    const usuariosSnap = await getDocs(collection(db, "usuarios"));

    if (usuariosSnap.empty) {
      mostrarErro("Nenhum usuário cadastrado ainda.");
      return;
    }

    const ranking = [];

    await Promise.all(usuariosSnap.docs.map(async (userDoc) => {
      const uid = userDoc.id;
      const data = userDoc.data();

      const nomeExibicao = resolverNome(data, uid);
      const fotoUrl = data.fotoUrl || null;
      const avatarEmoji = data.avatar || nomeExibicao[0].toUpperCase();
      const badges = data.badges || [];

      const { totalXp, totalLicoes } = await calcularXpUsuario(uid, catalogoMaterias);

      if (totalLicoes > 0) {
        ranking.push({ uid, nomeExibicao, fotoUrl, avatarEmoji, badges, xp: totalXp, licoes: totalLicoes });
      }
    }));

    ranking.sort((a, b) => b.xp - a.xp);
    rankingGlobal = ranking;

    let totalXpComunidade = 0, totalLicComunidade = 0;
    ranking.forEach(r => { totalXpComunidade += r.xp; totalLicComunidade += r.licoes; });
    document.getElementById("totalCommunityXp").textContent = totalXpComunidade.toLocaleString("pt-BR") + " XP";
    document.getElementById("totalCommunityLicoes").textContent = totalLicComunidade.toLocaleString("pt-BR");

    renderPodium(rankingGlobal);
    renderLista(rankingGlobal);
    renderMyRank(rankingGlobal);

    document.getElementById("searchRank")?.addEventListener("input", aplicarFiltros);
    document.getElementById("btnSort")?.addEventListener("click", () => {
      sortAsc = !sortAsc;
      document.getElementById("btnSort").style.transform = sortAsc ? "scaleY(-1)" : "scaleY(1)";
      aplicarFiltros();
    });

  } catch (e) {
    console.error("[Ranking] Erro:", e);
    mostrarErro("Erro ao carregar ranking. Verifique sua conexão.");
  }
}

function mostrarErro(msg) {
  document.getElementById("skeletons").innerHTML =
    `<p style="color:var(--error);text-align:center;padding:1rem">${msg}</p>`;
}

// ── Avatar: foto base64 ou círculo com inicial/emoji ─────────────
function avatarHtmlPodium(u, isEmpty, bgColor) {
  if (!isEmpty && u.fotoUrl) {
    return `
      <div class="podium-avatar" style="overflow:hidden;padding:0;background:transparent;">
        <img src="${u.fotoUrl}"
             style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
             alt="${u.nomeExibicao}"
             onerror="this.parentElement.textContent='${u.avatarEmoji}'">
      </div>`;
  }
  return `<div class="podium-avatar" style="background:${bgColor}">${u.avatarEmoji}</div>`;
}

function avatarHtmlLista(u) {
  if (u.fotoUrl) {
    return `
      <div class="rank-avatar" style="overflow:hidden;padding:0;">
        <img src="${u.fotoUrl}"
             style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
             alt="${u.nomeExibicao}"
             onerror="this.parentElement.textContent='${u.avatarEmoji}'">
      </div>`;
  }
  return `<div class="rank-avatar">${u.avatarEmoji}</div>`;
}

function renderPodium(ranking) {
  const vazio = { avatarEmoji: "?", nomeExibicao: "Ainda Vazio", xp: 0, _vazio: true };
  const top3 = [ranking[0] || vazio, ranking[1] || vazio, ranking[2] || vazio];

  // Ordem visual: 2º | 1º | 3º
  const order = [top3[1], top3[0], top3[2]];
  const blocks = ["p2", "p1", "p3"];
  const medals = ["🥈", "🥇", "🥉"];
  const colors = ["#9ca3af", "#f59e0b", "#b45309"];

  const wrap = document.getElementById("podiumWrap");
  wrap.innerHTML = "";

  order.forEach((u, i) => {
    const isEmpty = !!u._vazio;
    const div = document.createElement("div");
    div.className = "podium-item";
    if (isEmpty) div.style.cssText = "opacity:0.5;filter:grayscale(1);";

    div.innerHTML = `
      ${avatarHtmlPodium(u, isEmpty, colors[i])}
      <div class="podium-name">${isEmpty ? "Ainda Vazio" : u.nomeExibicao}</div>
      <div class="podium-xp" style="${isEmpty ? "visibility:hidden;" : ""}">
        ${u.xp.toLocaleString("pt-BR")} XP
      </div>
      <div class="podium-block ${blocks[i]}">${medals[i]}</div>
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
  list.innerHTML = "";
  empty.classList.add("hidden");

  if (rankingListFiltered.length === 0) {
    empty.classList.remove("hidden");
    sub.textContent = "0 estudantes";
    return;
  }

  const total = rankingListFiltered.length;
  sub.textContent = `${total} estudante${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`;

  const posClasses = ["gold", "silver", "bronze"];

  rankingListFiltered.forEach((u) => {
    const originalIndex = rankingGlobal.findIndex(ro => ro.uid === u.uid);
    const pos = originalIndex + 1;
    const row = document.createElement("div");
    row.className = "rank-row" + (u.uid === myUid ? " me" : "");

    const posClass = pos <= 3 ? posClasses[pos - 1] : "";
    const medal = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `#${pos}`;

    const euTag = u.uid === myUid
      ? `<span style="font-size:0.72rem;background:rgba(95,124,255,0.15);color:var(--accent);padding:2px 8px;border-radius:20px;font-weight:800;margin-left:6px;">Você</span>`
      : "";

    const badgesStr = (u.badges || []).map(b =>
      b === "primeiro_passo" ? "🌱" : b === "fogo_3_dias" ? "🔥" : b === "maquina_xp" ? "⚡" : ""
    ).join("");

    row.innerHTML = `
      <div class="rank-pos ${posClass}">${medal}</div>
      ${avatarHtmlLista(u)}
      <div class="rank-info">
        <div class="rank-email">
          ${u.nomeExibicao}
          ${euTag}
          <span style="font-size:0.85rem;margin-left:4px;letter-spacing:2px;">${badgesStr}</span>
        </div>
        <div class="rank-detail">
          ${u.licoes} lição${u.licoes !== 1 ? "ões" : ""} concluída${u.licoes !== 1 ? "s" : ""}
        </div>
      </div>
      <div class="rank-xp">${u.xp.toLocaleString("pt-BR")}<span>XP</span></div>
    `;
    list.appendChild(row);
  });
}

function aplicarFiltros() {
  const termo = (document.getElementById("searchRank")?.value || "").toLowerCase().trim();
  let filtrado = rankingGlobal.filter(u => u.nomeExibicao.toLowerCase().includes(termo));
  filtrado.sort((a, b) => sortAsc ? a.xp - b.xp : b.xp - a.xp);
  renderLista(filtrado);
}

function renderMyRank(ranking) {
  const myIdx = ranking.findIndex(u => u.uid === myUid);
  const card = document.getElementById("myRankCard");
  card.classList.remove("hidden");

  if (myIdx === -1) {
    document.getElementById("myRankVal").textContent = "—";
    document.getElementById("myXpVal").textContent = "0 XP";
    return;
  }

  document.getElementById("myRankVal").textContent = `#${myIdx + 1}`;
  document.getElementById("myXpVal").textContent = `${ranking[myIdx].xp.toLocaleString("pt-BR")} XP`;

  setTimeout(() => {
    document.querySelector(".rank-row.me")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 300);
}