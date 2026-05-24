import { auth } from "../db/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getHistoricoCompleto, getMateria, getUserStats } from "../db/progresso.js";
import { initUserMenu } from "../utils/userMenu.js";

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("btnLogout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "../login/login.html";
            } catch (error) {
                console.error("Erro ao fazer logout:", error);
            }
        });
    }
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../login/login.html";
        return;
    }

    // initUserMenu lê Firestore e atualiza topbar com nome de exibição + foto
    await initUserMenu(user);

    try {
        await renderDashboardData(user.uid);
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
});

async function renderDashboardData(uid) {
    const historico = await getHistoricoCompleto(uid);
    const stats = await getUserStats(uid);

    document.getElementById("statsLicoes").textContent = stats.totalLicoes;
    document.getElementById("statsAcerto").textContent = stats.taxaAcerto + "%";
    document.getElementById("statsXp").textContent = stats.totalXp + " XP";
    document.getElementById("statNivel").textContent = stats.nivel;
    document.getElementById("statSequencia").textContent = (stats.sequencia > 0 ? stats.sequencia + " dia" + (stats.sequencia > 1 ? "s" : "") : "0 dias");

    const container = document.getElementById("quickContinueContainer");
    const heroExplore = document.getElementById("heroExplore");

    if (historico.length > 0) {
        heroExplore.style.display = "none";
        const ultimaLicao = historico[0];
        const materiaDados = await getMateria(ultimaLicao.materiaId);

        if (materiaDados) {
            container.innerHTML = `
        <div class="continue-card" onclick="window.location.href='../materias/materias.html'">
          <div class="continue-left">
            <div class="continue-icon">${materiaDados.emoji || "📚"}</div>
            <div>
              <h3 class="continue-materia">${materiaDados.nome}</h3>
              <p class="continue-detalhes">Nível: ${materiaDados.nivel} &middot; Último tópico: ${ultimaLicao.topico}</p>
            </div>
          </div>
          <button class="btn-play">
            Continuar Aprendendo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>
      `;
        } else {
            container.style.display = "none";
            heroExplore.style.display = "flex";
        }
    } else {
        container.style.display = "none";
        heroExplore.style.display = "flex";
    }
}