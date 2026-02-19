// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// As tuas chaves secretas do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBwZSP9g7kJb_djqx_1-tHdtgO3XLChm6E",
  authDomain: "vizinhomais.firebaseapp.com",
  projectId: "vizinhomais",
  storageBucket: "vizinhomais.firebasestorage.app",
  messagingSenderId: "626292460867",
  appId: "1:626292460867:web:4d18ab05ebb88c4bbcf3f6",
  measurementId: "G-GZ2H4YW2Q4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o Auth para o Register.js conseguir usar
export const auth = getAuth(app);