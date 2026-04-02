   import { auth } from "../db/firebase.js";
    import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import { getCatalogo, getProgressoMateria, getTopicos, salvarTopicos, criarLicao, getLicoes } from "../db/progresso.js";
    import { gerarTopicos } from "../db/gemini.js";

    let uid = null;
    let catalogo = [];
    let progressos = [];
    let materiaAtiva = null;
    let topicoSelecionado = null;
    let qtdSelecionada = 5;

    window.navTo = (url) => window.location.href = url;

    onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = "../login/login.html"; return; }
      uid = user.uid;
      document.getElementById("userEmail").textContent = user.email.split("@")[0];
      document.getElementById("avatar").textContent = user.email[0].toUpperCase();

      // Stats opcionais
      try {
        const { getUserStats } = await import("../db/progresso.js");
        const s = await getUserStats(uid).catch(() => null);
        if (s) {
          document.getElementById("statSequencia").textContent = (s.sequencia ?? 0) + " dias";
          document.getElementById("statNivel").textContent = s.nivel ?? 1;
        }
      } catch(e) {
        document.getElementById("statSequencia").textContent = "0 dias";
        document.getElementById("statNivel").textContent = "1";
      }

      await carregarTrilhas();
    });

    document.getElementById("btnLogout").addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "../login/login.html";
    });

    // Filtros
    let filtroAtual = "todos";
    document.getElementById("filters").addEventListener("click", e => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtroAtual = btn.dataset.nivel;
      document.querySelectorAll(".trilha-card").forEach(card => {
        card.classList.toggle("hidden", filtroAtual !== "todos" && card.dataset.nivel !== filtroAtual);
      });
    });

    async function carregarTrilhas() {
      catalogo = await getCatalogo().catch(() => []);
      progressos = await Promise.all(
        catalogo.map(m => getProgressoMateria(uid, m.id).catch(() => ({ porcentagem: 0, licoesFeitas: 0 })))
      );

      const list = document.getElementById("trilhasList");
      list.innerHTML = "";

      if (!catalogo.length) {
        list.innerHTML = `<p style="color:rgba(255,255,255,0.5);text-align:center;padding:40px;grid-column:1/-1">
          Nenhuma matéria cadastrada ainda. Adicione em <strong>config/materias</strong> no Firestore.
        </p>`;
        return;
      }

      catalogo.forEach((m, i) => {
        const prog = progressos[i];
        const cor = m.cor ?? "#5f7cff";
        const card = document.createElement("div");
        card.className = "trilha-card";
        card.dataset.nivel = m.nivelFiltro ?? "fund2";

        card.innerHTML = `
          <div class="trilha-top">
            <span class="trilha-nivel">${m.nivel ?? m.escolaridade ?? ""}</span>
            <div class="trilha-pct-badge" style="background:color-mix(in srgb,${cor} 30%,rgba(255,255,255,0.1))">
              <span style="font-size:11px;font-weight:900;color:#fff">${prog.porcentagem}%</span>
            </div>
          </div>
          <div class="trilha-nome">${m.emoji ?? ""} ${m.nome}</div>
          <div class="trilha-desc">${m.descricao ?? ((m.escolaridade ?? "") + " · " + (m.nivel ?? ""))}</div>
          <div class="trilha-prog">
            <div class="trilha-prog-fill" style="width:${prog.porcentagem}%;background:${cor}"></div>
          </div>
        `;

        card.addEventListener("click", () => selecionarMateria(m, prog, card));
        list.appendChild(card);
      });

      // Seleciona primeiro automaticamente
      if (catalogo.length > 0) {
        const firstCard = list.querySelector(".trilha-card");
        selecionarMateria(catalogo[0], progressos[0], firstCard);
      }
    }

    async function selecionarMateria(m, prog, cardEl) {
      materiaAtiva = m;
      document.querySelectorAll(".trilha-card").forEach(c => c.classList.remove("active"));
      cardEl.classList.add("active");

      const panelEmpty = document.getElementById("panelEmpty");
      const panelContent = document.getElementById("panelContent");
      panelEmpty.style.display = "none";
      panelContent.style.display = "flex";

      panelContent.innerHTML = `
        <div class="caminho-ativo">
          <p class="panel-label">Caminho ativo</p>
          <div class="panel-header" style="margin-top:6px;">
            <div>
              <p class="panel-materia-name">${m.nome}</p>
              <p class="panel-materia-sub">${m.descricao ?? ((m.escolaridade ?? "") + " · " + (m.nivel ?? ""))}</p>
            </div>
            <div class="panel-pct-badge">PROGRESSO ${prog.porcentagem}%</div>
          </div>
        </div>
        <div class="topicos-section" id="topicosSection">
          <div style="color:rgba(255,255,255,0.4);font-size:13px;padding:8px;">Carregando tópicos…</div>
        </div>
      `;

      // Carrega tópicos
      let topicos = await getTopicos(uid, m.id).catch(() => []);
      if (!topicos || !topicos.length) {
        try {
          topicos = await gerarTopicos(m.nome, m.nivel ?? "");
          await salvarTopicos(uid, m.id, topicos);
        } catch(e) { topicos = ["Geral"]; }
      }
      if (!topicos.includes("Geral")) topicos.push("Geral");

      const licoes = await getLicoes(uid, m.id).catch(() => []);
      const concluidos = new Set(licoes.filter(l => l.concluida).map(l => l.topico));

      const sec = document.getElementById("topicosSection");
      sec.innerHTML = "";

      topicos.forEach((t, i) => {
  const done = concluidos.has(t);

  const item = document.createElement("div");
  item.className = "topico-item";

  item.innerHTML = `
    <div class="topico-left">
      <div class="topico-status ${done ? "done" : "ready"}">
        ${done ? "✓" : "📖"}
      </div>
      <div>
        <div class="topico-title">${t}</div>
        <div class="topico-sub">
          ${done ? "Concluída" : "Disponível"}
        </div>
      </div>
    </div>

    <div class="topico-right">
      <span class="topico-xp">+${(i + 1) * 20} XP</span>
      <button class="btn-iniciar ${done ? "repetir" : ""}">
        ${done ? "Repetir" : "Iniciar"}
      </button>
    </div>
  `;

  // 🔥 AGORA SEMPRE PODE CLICAR (mesmo concluído)
  item.querySelector(".btn-iniciar").addEventListener("click", (e) => {
    e.stopPropagation();
    abrirModal(t, m);
  });

  sec.appendChild(item);
});

    }

    function abrirModal(topico, m) {
      topicoSelecionado = topico;
      qtdSelecionada = 5;
      document.getElementById("modalIcon").textContent = m.emoji ?? "📖";
      document.getElementById("modalTitle").textContent = `Nova lição: ${topico}`;
      document.getElementById("modalTopico").textContent = topico;
      document.getElementById("modalMateria").textContent = m.nome;
      document.querySelectorAll(".qtd-btn").forEach(b =>
        b.classList.toggle("active", Number(b.dataset.qtd) === 5));
      document.getElementById("qtdLabel").textContent = "5 questões";
      document.getElementById("modalOverlay").classList.remove("hidden");
    }

    document.getElementById("qtdGrid").addEventListener("click", e => {
      const btn = e.target.closest(".qtd-btn"); if (!btn) return;
      qtdSelecionada = Number(btn.dataset.qtd);
      document.querySelectorAll(".qtd-btn").forEach(b => b.classList.toggle("active", b === btn));
      document.getElementById("qtdLabel").textContent =
        `${qtdSelecionada} questão${qtdSelecionada > 1 ? "s" : ""}`;
    });

    document.getElementById("btnCancel").addEventListener("click", () =>
      document.getElementById("modalOverlay").classList.add("hidden"));
    document.getElementById("modalOverlay").addEventListener("click", e => {
      if (e.target === document.getElementById("modalOverlay"))
        document.getElementById("modalOverlay").classList.add("hidden");
    });

    document.getElementById("btnConfirm").addEventListener("click", async () => {
      if (!topicoSelecionado || !uid || !materiaAtiva) return;
      const btn = document.getElementById("btnConfirm");
      btn.disabled = true; btn.textContent = "Criando…";
      try {
        const m = materiaAtiva;
        const licaoId = await criarLicao(uid, m.id, topicoSelecionado, qtdSelecionada);
        const p = new URLSearchParams({
          licaoId, materiaId: m.id, materiaNome: m.nome,
          nivel: m.nivel ?? "", escolaridade: m.escolaridade ?? "",
          topico: topicoSelecionado, emoji: m.emoji ?? "📚",
          cor: m.cor ?? "#5f7cff", total: qtdSelecionada,
        });
        window.location.href = `../quiz/quiz.html?${p}`;
      } catch(e) {
        console.error(e);
        btn.disabled = false; btn.textContent = "Tentar novamente";
      }
    });