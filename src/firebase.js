import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDB13pp32Odl93he3e_nDg6Ju6EtcOhZ5c",
  authDomain: "nutrisearch-89678.firebaseapp.com",
  projectId: "nutrisearch-89678",
  storageBucket: "nutrisearch-89678.firebasestorage.app",
  messagingSenderId: "505149304049",
  appId: "1:505149304049:web:749f4932eb9a67d1accd50",
  measurementId: "G-REKSLER3E8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Opzionale
export const db = getFirestore(app); // Fondamentale per i dati
