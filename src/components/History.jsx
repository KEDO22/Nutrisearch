import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Copy, Trash2, Archive } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [currentWater, setCurrentWater] = useState(0);
  const [currentDiary, setCurrentDiary] = useState("");

  // Ascolta Storico
  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Ascolta Dati Attuali
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "daily"), (snap) => {
        if(snap.exists()) {
            setCurrentWater(snap.data().waterTotal || 0);
            setCurrentDiary(snap.data().dailyDiary || "");
        }
    });
    return () => unsub();
  }, []);

  const archiveDay = async () => {
    if(!currentDiary && currentWater === 0) return alert("Nulla da salvare!");
    
    if(confirm("Archiviare la giornata? L'acqua NON verrà azzerata.")) {
        await addDoc(collection(db, "history"), {
            date: new Date().toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' }),
            timestamp: new Date(),
            water: currentWater,
            meals: currentDiary || "Nessun pasto registrato"
        });

        // Resetta SOLO il diario
        await updateDoc(doc(db, "settings", "daily"), { dailyDiary: "" });
        alert("Archiviato con successo!");
    }
  };

  const deleteEntry = async (id) => {
    if(confirm("Eliminare questa scheda?")) await deleteDoc(doc(db, "history", id));
  };

  // --- MODIFICA QUI ---
  const copyEntry = (entry) => {
    // Ora copia SOLO il contenuto dei pasti, pulito.
    const text = entry.meals;
    navigator.clipboard.writeText(text);
    
    // Piccolo feedback (puoi usare showToast se l'hai implementato globalmente, altrimenti alert)
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = "Pasti copiati!";
        toast.className = "show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 1500);
    } else {
        alert("Copiato!");
    }
  };
  // -------------------

  return (
    <div className="fade-in">
        <h1 style={{color: 'var(--history-purple)'}}>Storico 📖</h1>
        
        <div style={{background: 'var(--bg-app)', padding: 15, borderRadius: 12, marginBottom: 20, border: '1px solid var(--border)'}}>
            <button onClick={archiveDay} style={{background: 'var(--history-purple)', display:'flex', alignItems:'center', justifyContent:'center', gap:10}}>
                <Archive size={18}/> Salva e Chiudi Giornata
            </button>
        </div>

        <div>
            {history.length === 0 && <p style={{textAlign:'center', color:'var(--text-sec)'}}>Nessuna storia salvata.</p>}
            {history.map(h => (
                <div key={h.id} className="history-card">
                    <div className="history-date">
                        {h.date}
                        <button onClick={() => copyEntry(h)} style={{background:'var(--accent)', width:'auto', padding:'4px 8px', fontSize:11, borderRadius:6, display:'inline-flex', alignItems:'center', gap:4}}>
                            <Copy size={12}/> Copia Pasti
                        </button>
                    </div>
                    <div className="history-water">💧 {h.water}ml bevuti</div>
                    <div className="history-meals">{h.meals}</div>
                    <div style={{textAlign:'right', marginTop:10}}>
                        <button onClick={() => deleteEntry(h.id)} style={{background:'transparent', color:'var(--danger)', width:'auto', padding:0, fontSize:11, display:'inline-flex', alignItems:'center', gap:4}}>
                            <Trash2 size={12}/> Elimina
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
