import React, { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function WaterTracker() {
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [waterLog, setWaterLog] = useState([]); // Array per la cronologia locale

  // Carica dati da Firebase
  useEffect(() => {
    const docRef = doc(db, "settings", "daily");
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWaterTotal(data.waterTotal || 0);
        setWaterGoal(data.waterGoal || 2000);
        setWaterLog(data.waterLog || []); // Carica il log se esiste
      }
    });
    return () => unsub();
  }, []);

  const updateCloud = async (newTotal, newLog) => {
    const docRef = doc(db, "settings", "daily");
    try {
        await setDoc(docRef, { 
            waterTotal: newTotal, 
            waterGoal,
            waterLog: newLog 
        }, { merge: true });
    } catch(e) { console.error(e); }
  };

  const addWater = (amount) => {
    const newVal = Math.max(0, waterTotal + amount); // Evita numeri negativi
    
    // Crea nuova voce per il log
    const newEntry = {
        amount: amount,
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        id: Date.now()
    };
    
    // Aggiungi in cima
    const newLog = [newEntry, ...waterLog];

    setWaterTotal(newVal); 
    setWaterLog(newLog);
    updateCloud(newVal, newLog);
  };

  const resetWater = () => {
    if(confirm("Azzerare acqua e cronologia di oggi?")) {
      setWaterTotal(0);
      setWaterLog([]);
      updateCloud(0, []);
    }
  };

  const setGoal = () => {
      let val = prompt("Imposta obiettivo (ml):", waterGoal);
      if(val && !isNaN(val)) {
          setWaterGoal(parseInt(val));
          // Aggiorna anche su cloud
          updateDoc(doc(db, "settings", "daily"), { waterGoal: parseInt(val) });
      }
  }

  const progress = Math.min((waterTotal / waterGoal) * 100, 100);

  return (
    <div className="fade-in">
      <h1 style={{color: 'var(--water-blue)'}}>Acquimetro 💧</h1>
      
      <div className="water-card">
        <div className="water-fill" style={{height: `${progress}%`}}></div>
        <div className="water-content">
          <h2>{waterTotal}</h2>
          <div onClick={setGoal} style={{cursor:'pointer'}}>su <span style={{fontWeight:'bold'}}>{waterGoal}</span> ml 🎯</div>
        </div>
      </div>

      <div className="grid-buttons">
        <button className="btn-water" onClick={() => addWater(50)}>+50</button>
        <button className="btn-water" onClick={() => addWater(100)}>+100</button>
        <button className="btn-water" onClick={() => addWater(200)}>+200</button>
        <button className="btn-water" onClick={() => addWater(250)}>+250</button>
        <button className="btn-water" onClick={() => addWater(500)}>+500</button>
        {/* TASTO MENO 50 */}
        <button className="btn-water" style={{background:'#e74c3c'}} onClick={() => addWater(-50)}>-50</button> 
      </div>
      
      <div style={{marginTop:10}}>
        <button className="btn-reset" onClick={resetWater}>Reset Giornaliero</button>
      </div>

      {/* CRONOLOGIA ACQUA */}
      <div style={{marginTop: 25, borderTop: '1px solid var(--border)', paddingTop: 15}}>
          <h4 style={{margin:'0 0 10px 0', color:'var(--text-sec)', fontSize:14}}>Cronologia Oggi</h4>
          <div style={{maxHeight: 150, overflowY: 'auto'}}>
              {waterLog.length === 0 && <p style={{fontSize:12, color:'#999', fontStyle:'italic'}}>Nessuna assunzione registrata.</p>}
              {waterLog.map(log => (
                  <div key={log.id} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px dashed #eee', fontSize:13}}>
                      <span style={{color:'var(--text-main)'}}>{log.time}</span>
                      <span style={{fontWeight:'bold', color: log.amount > 0 ? 'var(--water-blue)' : 'var(--danger)'}}>
                          {log.amount > 0 ? '+' : ''}{log.amount} ml
                      </span>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}
