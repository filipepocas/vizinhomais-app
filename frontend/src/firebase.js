import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwZSP9g7kJb_djqx_1-tHdtgO3XLChm6E",
  authDomain: "vizinhomais.firebaseapp.com",
  projectId: "vizinhomais",
  storageBucket: "vizinhomais.firebasestorage.app",
  messagingSenderId: "626292460867",
  appId: "1:626292460867:web:4d18ab05ebb88c4bbcf3f6",
  measurementId: "G-GZ2H4YW2Q4"
};

// Inicializa o Firebase apenas uma vez
const app = initializeApp(firebaseConfig);

// Exporta as ferramentas que a app usa
export const db = getFirestore(app);
export const auth = getAuth(app);