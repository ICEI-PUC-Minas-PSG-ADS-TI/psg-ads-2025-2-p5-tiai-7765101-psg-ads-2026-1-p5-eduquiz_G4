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
