import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Copy, Trash2, Archive } from 'lucide-react';

export default function History({ onRegisterUndo }) {
  const [history, setHistory] = useState([]);
  const [currentWater, setCurrentWater] = useState(0);
  const [currentDiary, setCurrentDiary] = useState("");

  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

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
        // Undo per l'archiviazione: ripristina il diario com'era
        const prevDiary = currentDiary;
        onRegisterUndo(async () => {
            await updateDoc(doc(db, "settings", "daily"), { dailyDiary: prevDiary });
            alert("Archiviazione annullata (Diario ripristinato)");
            // Nota: cancellare l'entry creata nello storico è complesso perché non abbiamo l'ID qui,
            // quindi ci limitiamo a ridare all'utente i suoi dati nel diario.
        });

        await addDoc(collection(db, "history"), {
            date: new Date().toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' }),
            timestamp: new Date(),
            water: currentWater,
            meals: currentDiary || "Nessun pasto registrato"
        });

        await updateDoc(doc(db, "settings", "daily"), { dailyDiary: "" });
        alert("Archiviato con successo!");
    }
  };

  const deleteEntry = async (item) => {
    if(confirm("Eliminare questa scheda?")) {
        // Undo per l'eliminazione
        onRegisterUndo(async () => {
            await addDoc(collection(db, "history"), {
                date: item.date,
                timestamp: item.timestamp,
                water: item.water,
                meals: item.meals
            });
            alert("Scheda ripristinata!");
        });

        await deleteDoc(doc(db, "history", item.id));
    }
  };

  const copyEntry = (entry) => {
    const text = entry.meals;
    navigator.clipboard.writeText(text);
    alert("Copiato!");
  };

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
                        <button onClick={() => deleteEntry(h)} style={{background:'transparent', color:'var(--danger)', width:'auto', padding:0, fontSize:11, display:'inline-flex', alignItems:'center', gap:4}}>
                            <Trash2 size={12}/> Elimina
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
