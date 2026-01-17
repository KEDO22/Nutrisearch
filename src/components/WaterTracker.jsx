import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function WaterTracker() {
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);

  // Carica dati da Firebase all'avvio
  useEffect(() => {
    const docRef = doc(db, "settings", "daily");
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWaterTotal(data.waterTotal || 0);
        setWaterGoal(data.waterGoal || 2000);
      }
    });
    return () => unsub(); // Pulizia
  }, []);

  // Funzione per aggiornare Firebase
  const updateCloud = async (newTotal) => {
    const docRef = doc(db, "settings", "daily");
    // Se il documento non esiste, setDoc lo crea, altrimenti updateDoc aggiorna
    try {
        await setDoc(docRef, { waterTotal: newTotal, waterGoal }, { merge: true });
    } catch(e) { console.error(e); }
  };

  const addWater = (amount) => {
    const newVal = waterTotal + amount;
    // React aggiorna l'UI istantaneamente (Optimistic UI)
    setWaterTotal(newVal); 
    // Poi aggiorna il cloud
    updateCloud(newVal);
  };

  const resetWater = () => {
    if(confirm("Azzerare acqua?")) {
      setWaterTotal(0);
      updateCloud(0);
    }
  };

  const progress = Math.min((waterTotal / waterGoal) * 100, 100);

  return (
    <div className="fade-in">
      <h1 style={{color: 'var(--water-blue)'}}>Acquimetro 💧</h1>
      
      <div className="water-card">
        <div className="water-fill" style={{height: `${progress}%`}}></div>
        <div className="water-content">
          <h2>{waterTotal}</h2>
          <p>su {waterGoal} ml</p>
        </div>
      </div>

      <div className="grid-buttons">
        {[50, 100, 200, 250, 500].map(amt => (
          <button key={amt} className="btn-water" onClick={() => addWater(amt)}>
            +{amt}
          </button>
        ))}
        <button className="btn-reset" onClick={resetWater}>Reset</button>
      </div>
    </div>
  );
}
