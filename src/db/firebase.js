import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCG77wL1zlDOHvEl4Vdu04DUGnwHkG4DtQ",
  authDomain: "eduquiz-5050c.firebaseapp.com",
  projectId: "eduquiz-5050c",
  storageBucket: "eduquiz-5050c.firebasestorage.app",
  messagingSenderId: "658745395417",
  appId: "1:658745395417:web:2d3bce9c29a09c0118d6c8",
  measurementId: "G-39FGP2M3BP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);