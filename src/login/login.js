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

  erro.innerText = "";

  if (!email || !senha) {
    erro.innerText = "Preencha email e senha";
    return;
  }

  signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {
      window.location.href = "../dashboard/dashboard.html";
    })

    .catch((error) => {
      console.error(error);

      if (error.code === "auth/invalid-login-credentials") {
        erro.innerText = "Email ou senha incorretos";
      } else {
        erro.innerText = error.message;
      }
    });
};
