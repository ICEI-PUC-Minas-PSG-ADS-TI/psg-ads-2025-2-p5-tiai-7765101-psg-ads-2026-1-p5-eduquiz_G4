import { auth } from "../db/firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "../dashboard/dashboard.html";
  }
});

window.login = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  // Limpa mensagens anteriores
  erro.innerText = "";

  // Validação básica de campos vazios
  if (!email || !senha) {
    erro.innerText = "Por favor, preencha todos os campos.";
    return;
  }

  // Chamada ao Firebase
  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      // Login com sucesso
      console.log("Sucesso:", userCredential.user);
      window.location.href = "../dashboard/dashboard.html";
    })
    .catch((error) => {
      console.error("Erro capturado:", error.code);

      // Tratamento amigável de erros
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        erro.innerText = "E-mail ou senha incorretos.";
      } else if (error.code === "auth/too-many-requests") {
        erro.innerText = "Muitas tentativas falhas. Aguarde um momento.";
      } else if (error.code === "auth/invalid-email") {
        erro.innerText = "Formato de e-mail inválido.";
      } else {
        erro.innerText = "Ocorreu um erro inesperado. Tente novamente.";
      }
    });
};
