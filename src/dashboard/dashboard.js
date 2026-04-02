import { auth } from "../db/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

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

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login/login.html";
    } else {
        console.log("Usuário logado:", user.email);
    }
});