<<<<<<< HEAD
import { auth } from "../db/firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Usuário está logado, podemos mostrar os dados dele
    console.log("Usuário logado:", user.email);
  } else {
    // Se não houver usuário, redireciona para o login imediatamente
    window.location.href = "../login/login.html";
  }
});

window.logout = function () {
  signOut(auth)
    .then(() => {
      console.log("Logout realizado com sucesso!");
      window.location.href = "../login/login.html";
    })
    .catch((error) => {
      console.error("Erro ao tentar sair:", error);
      alert("Erro ao encerrar sessão. Tente novamente.");
    });
};
=======
import { db, auth } from "../db/firebase.js";
import { doc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initTheme, toggleTheme, updateToggleIcon } from "../utils/theme.js";
import { initPerfil } from "../utils/perfil.js";

initTheme();
const btnTheme = document.getElementById("btnTheme");
if(btnTheme) {
    updateToggleIcon(btnTheme);
    btnTheme.addEventListener("click", () => { toggleTheme(); updateToggleIcon(btnTheme); });
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
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
    } else {
        await initPerfil(user);
        await carregarHub(user);
    }
});

async function carregarHub(user) {
  try {
    const nome = user.email.split("@")[0];
    document.getElementById("dashWelcomeTitle").textContent = `Bem-vindo, ${nome.charAt(0).toUpperCase() + nome.slice(1)} 🚀`;

    // 1. Busca dados do usuário (avatar, badges, streak)
    const userRef = doc(db, "usuarios", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    
    const data = snap.data();
    document.getElementById("dashStreak").textContent = data.currentStreak || 0;

    // 2. Calcula total de XP e Lições do aluno
    let totalAcertos = 0;
    let totalLicoes = 0;

    const materiasSnap = await getDocs(collection(db, "usuarios", user.uid, "materias")).catch(() => ({ docs: [] }));
    await Promise.all(materiasSnap.docs.map(async (matDoc) => {
      const licoesSnap = await getDocs(collection(db, "usuarios", user.uid, "materias", matDoc.id, "licoes")).catch(() => ({ docs: [] }));
      licoesSnap.docs.forEach(licDoc => {
        const l = licDoc.data();
        if (l.concluida) {
          totalAcertos += (l.acertos ?? 0);
          totalLicoes++;
        }
      });
    }));

    document.getElementById("dashTotalXp").textContent = totalAcertos + " XP";
    document.getElementById("dashTotalLicoes").textContent = totalLicoes;

    // 3. Renderiza o Mural de Conquistas
    const gallery = document.getElementById("dashBadgeGallery");
    gallery.innerHTML = "";
    const badgesInfo = {
       "primeiro_passo": { icon: "🌱", name: "Iniciante" },
       "fogo_3_dias": { icon: "🔥", name: "3 Dias" },
       "maquina_xp": { icon: "⚡", name: "Máquina" }
    };

    const minhasBadges = data.badges || [];
    if (minhasBadges.length === 0) {
       gallery.innerHTML = `<div class="dash-badge empty">Você ainda não possui conquistas. Faça lições!</div>`;
    } else {
       minhasBadges.forEach(b => {
         const info = badgesInfo[b];
         if(info) {
           const bDiv = document.createElement("div");
           bDiv.className = "dash-badge";
           bDiv.innerHTML = `<span>${info.icon}</span> ${info.name}`;
           gallery.appendChild(bDiv);
         }
       });
    }

  } catch(e) {
    console.error("Erro ao carregar Dashboard Hub:", e);
  }
}
>>>>>>> 4cc3ebc92991d56382f6daf59bc4ee612cb0c98a
