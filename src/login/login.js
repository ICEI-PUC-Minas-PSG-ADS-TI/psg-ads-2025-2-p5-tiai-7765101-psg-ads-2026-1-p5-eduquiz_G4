import { auth } from "../db/firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail, // <--- Importação necessária
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Redirecionamento se já estiver logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "../dashboard/dashboard.html";
  }
});

// FUNÇÃO DE LOGIN
window.login = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  erro.innerText = "";

  if (!email || !senha) {
    erro.innerText = "Por favor, preencha todos os campos.";
    return;
  }

  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      console.log("Sucesso:", userCredential.user);
      window.location.href = "../dashboard/dashboard.html";
    })
    .catch((error) => {
      console.error("Erro capturado:", error.code);
      tratarErrosFirebase(error.code);
    });
};

// FUNÇÃO DE ESQUECI MINHA SENHA
window.esqueciSenha = function () {
  const email = document.getElementById("email").value;
  const erro = document.getElementById("erro");

  erro.innerText = "";

  if (!email) {
    erro.style.color = "#ff9800";
    erro.style.fontWeight = "bold";
    erro.innerText = "Digite seu e-mail no campo acima para redefinir a senha.";
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      erro.style.color = "green";
      erro.style.fontWeight = "bold";
      erro.innerText = "E-mail de redefinição enviado com sucesso!";
    })
    .catch((error) => {
      console.error("Erro ao enviar e-mail:", error.code);
      if (error.code === "auth/user-not-found") {
        erro.style.color = "red";
        erro.style.fontWeight = "bold";
        erro.innerText = "E-mail não cadastrado.";
      } else if (error.code === "auth/invalid-email") {
        erro.style.color = "red";
        erro.style.fontWeight = "bold";
        erro.innerText = "Formato de e-mail inválido.";
      } else {
        erro.style.color = "red";
        erro.style.fontWeight = "bold";
        erro.innerText = "Erro ao enviar e-mail. Tente novamente.";
      }
    });
};

// Função auxiliar para não repetir código de erro no login
function tratarErrosFirebase(code) {
  const erro = document.getElementById("erro");
  erro.style.color = "red";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  ) {
    erro.innerText = "E-mail ou senha incorretos.";
  } else if (code === "auth/too-many-requests") {
    erro.innerText = "Muitas tentativas. Aguarde um momento.";
  } else if (code === "auth/invalid-email") {
    erro.innerText = "Formato de e-mail inválido.";
  } else {
    erro.innerText = "Ocorreu um erro inesperado.";
  }
}
