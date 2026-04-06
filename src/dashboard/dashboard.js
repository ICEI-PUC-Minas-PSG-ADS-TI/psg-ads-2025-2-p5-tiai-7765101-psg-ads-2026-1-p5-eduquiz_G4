import { auth } from "../db/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getHistoricoCompleto, getMateria, getUserStats } from "../db/progresso.js";

document.addEventListener("DOMContentLoaded", () => {
    // Topbar logout
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

    // Atualizar UI Básica do Topbar
    const emailStr = user.email || "Usuário";
    document.getElementById("userEmail").textContent = emailStr;
    const inicial = emailStr.charAt(0).toUpperCase();
    document.getElementById("avatar").textContent = inicial;

    try {
        await renderDashboardData(user.uid);
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    }
});

async function renderDashboardData(uid) {
    // 1. Puxar o histórico de lições concluídas (limitado para UI recente)
    const historico = await getHistoricoCompleto(uid);
    
    // 2. Puxar stats globais unificados
    const stats = await getUserStats(uid);

    // 3. Atualizar Cards Estatísticos e Topbar
    document.getElementById("statsLicoes").textContent = stats.totalLicoes;
    document.getElementById("statsAcerto").textContent = stats.taxaAcerto + "%";
    document.getElementById("statsXp").textContent = stats.totalXp + " XP";

    document.getElementById("statNivel").textContent = stats.nivel;
    document.getElementById("statSequencia").textContent = (stats.sequencia > 0 ? "1 dia" : "0 dias");

    // 3. Atualizar "Continuar de onde parou"
    const container = document.getElementById("quickContinueContainer");
    const heroExplore = document.getElementById("heroExplore");

    if (historico.length > 0) {
        heroExplore.style.display = "none";
        // Pega a última matéria acessada (o histórico já está ordenado desc na base)
        const ultimaLicao = historico[0];
        const materiaDados = await getMateria(ultimaLicao.materiaId);
        
        if (materiaDados) {
            container.innerHTML = `
                <div class="continue-card" onclick="window.location.href='../materias/materias.html'">
                  <div class="continue-left">
                    <div class="continue-icon">${materiaDados.emoji || '📚'}</div>
                    <div>
                      <h3 class="continue-materia">${materiaDados.nome}</h3>
                      <p class="continue-detalhes">Nível: ${materiaDados.nivel} &middot; Último tópico: ${ultimaLicao.topico}</p>
                    </div>
                  </div>
                  <button class="btn-play">
                    Continuar Apprendendo
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </button>
                </div>
            `;
        } else {
             // Caso não encontre a matéria por algum motivo
             container.style.display = "none";
             heroExplore.style.display = "flex";
        }
    } else {
        // Sem histórico
        container.style.display = "none";
        heroExplore.style.display = "flex";
    }
}