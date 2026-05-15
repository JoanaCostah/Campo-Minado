import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrQ_G1bhKIlDuT5Tm4W6XtmxzGPaGoqA0",
  authDomain: "jogo-campo-minado.firebaseapp.com",
  databaseURL: "https://jogo-campo-minado-default-rtdb.firebaseio.com",
  projectId: "jogo-campo-minado",
  storageBucket: "jogo-campo-minado.firebasestorage.app",
  messagingSenderId: "724165633129",
  appId: "1:724165633129:web:eea7f707ae03b72b472ef8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };