import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnJ-CzprDVpwikxkgkDJaQm127dIwHP-s",
  authDomain: "labkey-73033.firebaseapp.com",
  projectId: "labkey-73033",
  storageBucket: "labkey-73033.firebasestorage.app",
  messagingSenderId: "463013682380",
  appId: "1:463013682380:web:5aba994a8261feefeb7669",
  measurementId: "G-X0H46E85BX"
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Exportar db también
