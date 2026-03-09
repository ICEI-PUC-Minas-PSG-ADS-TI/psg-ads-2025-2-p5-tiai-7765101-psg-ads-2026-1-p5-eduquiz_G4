import { auth } from "../db/firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.cadastrar = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  erro.innerText = "";

  // Validação de segurança: 8+ caracteres, 1 maiúscula e 1 número
  const regexSenha = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!regexSenha.test(senha)) {
    erro.innerText =
      "A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um número.";
    return; // Interrompe o cadastro se a senha for fraca
  }

  // Chamada para criar o usuário no Firebase Auth
  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      alert("Conta criada com sucesso");
      window.location.href = "../login/login.html";
    })
    .catch((error) => {
      console.error("Erro capturado:", error.code);

      // Tratamento de erros específicos para uma melhor UX
      switch (error.code) {
        case "auth/email-already-in-use":
          erro.innerText = "Este e-mail já está cadastrado.";
          break;
        case "auth/invalid-email":
          erro.innerText = "O formato do e-mail é inválido.";
          break;
        case "auth/weak-password":
          erro.innerText = "A senha é muito fraca para o sistema.";
          break;
        default:
          erro.innerText = "Erro ao criar conta: " + error.message;
      }
    });
};
