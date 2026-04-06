import { auth } from "../db/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getHistoricoCompleto, getMateria } from "../db/progresso.js";

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
    // 1. Puxar o histórico de lições concluídas
    const historico = await getHistoricoCompleto(uid);
    
    let totalLicoesConcluidas = historico.length;
    let totalAcertos = 0;
    let totalQuestoesTentadas = 0;
    let totalXp = 0;

    historico.forEach(licao => {
        totalAcertos += (licao.acertos || 0);
        totalQuestoesTentadas += (licao.total || 0);
        totalXp += (licao.xp && licao.xp > 0) ? licao.xp : ((licao.acertos || 0) * 20); 
    });

    const taxaAcerto = totalQuestoesTentadas > 0 ? Math.round((totalAcertos / totalQuestoesTentadas) * 100) : 0;

    // 2. Atualizar Cards Estatísticos e Topbar
    document.getElementById("statsLicoes").textContent = totalLicoesConcluidas;
    document.getElementById("statsAcerto").textContent = taxaAcerto + "%";
    document.getElementById("statsXp").textContent = totalXp + " XP";

    // O nível na topbar poderia ser XP / 100 por exemplo
    const nivelCalculado = Math.floor(totalXp / 100) + 1;
    document.getElementById("statNivel").textContent = nivelCalculado;
    
    // Simulação de sequência (poderia vir de um BD de logins diários)
    document.getElementById("statSequencia").textContent = (totalLicoesConcluidas > 0 ? "1 dia" : "0 dias");

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