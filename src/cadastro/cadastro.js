import { auth } from "../db/firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

window.cadastrar = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const erro = document.getElementById("erro");

  erro.innerText = "";

  createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      alert("Conta criada com sucesso");

      window.location.href = "../login/login.html";
    })

    .catch((error) => {
      erro.innerText = error.message;
    });
};
