import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, deleteDoc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Search, Plus, Trash2, Copy, Save, RotateCcw } from 'lucide-react';

const INITIAL_DB = [
    { name: "Yogurt Soia Bianco (Primia)", desc: "125g | 85 kcal, 3.6g Pro" },
    { name: "Mela", desc: "52 kcal/100g" },
    { name: "Pollo Petto", desc: "165 kcal/100g, 31g Pro" },
    { name: "Riso Basmati", desc: "360 kcal/100g" },
    // ... puoi aggiungere qui la tua lista lunga iniziale se vuoi ripristinarla
];

export default function FoodDiary() {
  const [foodDb, setFoodDb] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  
  // Input form
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("g");
  const [meal, setMeal] = useState("COLAZIONE");
  
  // Diario e Note
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [showDbManager, setShowDbManager] = useState(false);

  // New DB Item inputs
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // 1. Carica Database Alimenti
  useEffect(() => {
    const q = query(collection(db, "foods"), orderBy("name"));
    const unsub = onSnapshot(q, (snapshot) => {
      setFoodDb(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 2. Carica Diario e Note Giornaliere
  useEffect(() => {
    const docRef = doc(db, "settings", "daily");
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSummary(data.dailyDiary || "");
        setNotes(data.notes || "");
      }
    });
    return () => unsub();
  }, []);

  // -- LOGICA RICERCA --
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.length < 2) { setSuggestions([]); return; }
    const filtered = foodDb.filter(f => f.name.toLowerCase().includes(val.toLowerCase()));
    setSuggestions(filtered);
  };

  const selectFood = (food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
    setSuggestions([]);
  };

  // -- AGGIORNAMENTO DATI CLOUD --
  const updateDaily = async (field, value) => {
    const docRef = doc(db, "settings", "daily");
    try {
      await setDoc(docRef, { [field]: value }, { merge: true });
    } catch (e) { console.error("Errore salvataggio", e); }
  };

  const addToSummary = () => {
    if (!selectedFood) return;
    let text = summary;
    if (!text.includes(`[${meal}]`)) text += (text ? "\n\n" : "") + `[${meal}]\n`;
    text += `• ${qty ? qty + unit + ' di ' : ''}${selectedFood.name} | ${selectedFood.desc}\n`;
    
    setSummary(text);
    updateDaily('dailyDiary', text);
    setSearchTerm("");
    setSelectedFood(null);
    setQty("");
  };

  // -- DB MANAGEMENT --
  const saveToDb = async () => {
    if (!newName || !newDesc) return alert("Compila i campi");
    await addDoc(collection(db, "foods"), { name: newName, desc: newDesc });
    setNewName(""); setNewDesc(""); alert("Salvato!");
  };

  const deleteFromDb = async (id) => {
    if(confirm("Eliminare definitivamente?")) await deleteDoc(doc(db, "foods", id));
  };

  const resetInitialDb = async () => {
    if(!confirm("Questo caricherà i dati base nel Cloud. Procedere?")) return;
    INITIAL_DB.forEach(async (item) => {
       await addDoc(collection(db, "foods"), item);
    });
  };

  // -- NOTE --
  const handleNoteChange = (e) => {
    setNotes(e.target.value);
    updateDaily('notes', e.target.value); // Salvataggio live
  };

  const addNoteToDiary = () => {
    let text = summary + `\n[NOTE]: ${notes}\n`;
    setSummary(text);
    updateDaily('dailyDiary', text);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    alert("Copiato!");
  };

  const clearDiary = () => {
    if(confirm("Svuotare il diario?")) {
        setSummary("");
        updateDaily('dailyDiary', "");
    }
  };

  return (
    <div className="fade-in">
      <h1>NutriSearch 🍎</h1>

      {/* SELEZIONE PASTO */}
      <div className="section">
        <select value={meal} onChange={(e) => setMeal(e.target.value)} className="meal-selector">
          <option value="COLAZIONE">☕ Colazione</option>
          <option value="PRANZO">🍝 Pranzo</option>
          <option value="CENA">🥗 Cena</option>
          <option value="SPUNTINO">🍎 Spuntino</option>
        </select>
      </div>

      {/* RICERCA */}
      <div className="section" style={{position: 'relative'}}>
        <input 
          type="text" 
          placeholder="Cerca alimento..." 
          value={searchTerm}
          onChange={handleSearch}
        />
        {suggestions.length > 0 && (
          <div id="suggestions" style={{display:'block'}}>
            {suggestions.map(f => (
              <div key={f.id} className="suggestion-item" onClick={() => selectFood(f)}>
                {f.name}
              </div>
            ))}
          </div>
        )}

        {selectedFood && (
          <div id="resultArea" style={{display:'block'}}>
            <h3 style={{margin:0, color:'var(--primary)'}}>{selectedFood.name}</h3>
            <p style={{fontSize:13, color:'#666'}}>{selectedFood.desc}</p>
            <div className="qty-row">
              <input type="number" placeholder="Qtà" value={qty} onChange={e => setQty(e.target.value)}/>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="g">g</option><option value="ml">ml</option><option value="pz">pz</option>
              </select>
            </div>
            <button onClick={addToSummary} style={{background: 'var(--accent)'}}>Aggiungi al Diario ↓</button>
          </div>
        )}
      </div>

      {/* AREA TESTO E NOTE */}
      <div className="section">
        <textarea 
            id="finalSummary" 
            rows="8" 
            value={summary}
            onChange={(e) => { setSummary(e.target.value); updateDaily('dailyDiary', e.target.value); }}
            placeholder="Il diario apparirà qui..."
        ></textarea>
        
        <div style={{display:'flex', gap:10, marginBottom: 20}}>
            <button onClick={copyToClipboard} style={{background: 'var(--text-main)'}}><Copy size={16}/> Copia</button>
            <button onClick={clearDiary} style={{background: 'var(--border)', color:'#555'}}><Trash2 size={16}/> Svuota</button>
        </div>

        {/* NOTE PERSISTENTI */}
        <div className="notes-area">
            <h4>📝 Note Personali (Non si cancellano)</h4>
            <textarea 
                value={notes} 
                onChange={handleNoteChange} 
                placeholder="Scrivi qui note fisse..."
            ></textarea>
            <div style={{display:'flex', gap:10, marginTop:5}}>
                <button onClick={addNoteToDiary} style={{background: '#f1c40f', color:'#333', fontSize:12}}>+ Al Diario</button>
                <button onClick={() => { setNewName("Nota"); setNewDesc(notes); setShowDbManager(true); }} style={{background: 'var(--primary)', fontSize:12}}>+ Crea DB</button>
            </div>
        </div>
      </div>

      {/* GESTIONE DATABASE */}
      <div style={{textAlign:'center'}}>
        <button className="toggle-btn" onClick={() => setShowDbManager(!showDbManager)}>⚙️ Gestisci Database</button>
      </div>

      {showDbManager && (
        <div className="section" style={{background:'var(--bg-color)', padding:15, borderRadius:10, marginTop:10}}>
            <button onClick={resetInitialDb} style={{background:'var(--danger)', fontSize:12, marginBottom:10}}>⚠️ Carica DB Base</button>
            <div id="addForm">
                <input type="text" placeholder="Nome" value={newName} onChange={e => setNewName(e.target.value)} />
                <textarea rows="2" placeholder="Descrizione" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <button onClick={saveToDb}>Salva nel Cloud</button>
            </div>
            <div style={{marginTop:15, maxHeight:200, overflowY:'auto'}}>
                {foodDb.map(f => (
                    <div key={f.id} style={{display:'flex', justifyContent:'space-between', padding:10, borderBottom:'1px solid #eee', alignItems:'center'}}>
                        <span style={{fontSize:12}}><b>{f.name}</b></span>
                        <button onClick={() => deleteFromDb(f.id)} style={{background:'var(--danger)', width:'auto', padding:'5px 10px'}}><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
