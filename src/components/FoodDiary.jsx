import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, deleteDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Search, Trash2, Copy, Edit2 } from 'lucide-react';

const INITIAL_DB = [
    { name: "Yogurt Soia Bianco (Primia)", desc: "125g | 85 kcal, 3.6g Pro" },
    { name: "Mela", desc: "52 kcal/100g" },
    { name: "Pollo Petto", desc: "165 kcal/100g, 31g Pro" },
];

// Riceve onRegisterUndo come prop
export default function FoodDiary({ onRegisterUndo }) {
  const [foodDb, setFoodDb] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("g");
  const [meal, setMeal] = useState("COLAZIONE");
  
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [showDbManager, setShowDbManager] = useState(false);

  const [dbSearch, setDbSearch] = useState(""); 
  const [editingId, setEditingId] = useState(null); 
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Caricamento dati (DB e Diario)
  useEffect(() => {
    const q = query(collection(db, "foods"), orderBy("name"));
    const unsub = onSnapshot(q, (snap) => setFoodDb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "daily"), (snap) => {
      if (snap.exists()) {
        if (document.activeElement !== document.getElementById('finalSummary')) {
            setSummary(snap.data().dailyDiary || "");
        }
        setNotes(snap.data().notes || "");
      }
    });
    return () => unsub();
  }, []);

  const updateDaily = async (field, value) => {
    try { await setDoc(doc(db, "settings", "daily"), { [field]: value }, { merge: true }); } catch (e) {}
  };

  // --- AZIONI CON UNDO ---

  const addToSummary = () => {
    if (!selectedFood) return;
    
    // 1. Salva stato precedente per Undo
    const previousSummary = summary;
    onRegisterUndo(() => {
        setSummary(previousSummary);
        updateDaily('dailyDiary', previousSummary);
        alert("Aggiunta annullata!");
    });

    let text = summary;
    if (!text.includes(`[${meal}]`)) text += (text ? "\n\n" : "") + `[${meal}]\n`;
    text += `• ${qty ? qty + ' ' + unit + ' di ' : ''}${selectedFood.name} | ${selectedFood.desc}\n`;
    
    setSummary(text);
    updateDaily('dailyDiary', text);
    setSearchTerm(""); setSelectedFood(null); setQty("");
  };

  const deleteFromDb = async (id) => {
    const itemToDelete = foodDb.find(f => f.id === id);
    if(confirm("Eliminare definitivamente?")) {
        // 1. Salva stato per Undo
        onRegisterUndo(async () => {
            await addDoc(collection(db, "foods"), { name: itemToDelete.name, desc: itemToDelete.desc });
            alert("Alimento ripristinato!");
        });
        
        await deleteDoc(doc(db, "foods", id));
    }
  };

  const clearDiary = () => { 
      if(summary.length > 0 && confirm("Svuotare?")) { 
          // 1. Salva stato per Undo
          const previousSummary = summary;
          onRegisterUndo(() => {
              setSummary(previousSummary);
              updateDaily('dailyDiary', previousSummary);
              alert("Diario ripristinato!");
          });

          setSummary(""); 
          updateDaily('dailyDiary', "");
      } 
  };

  const clearNotes = () => {
      if(confirm("Cancellare le note?")) {
          const prevNotes = notes;
          onRegisterUndo(() => {
              setNotes(prevNotes);
              updateDaily('notes', prevNotes);
          });
          setNotes("");
          updateDaily('notes', "");
      }
  };

  // --- ALTRE FUNZIONI ---
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

  const handleSaveToDb = async () => {
    if (!newName || !newDesc) return alert("Compila i campi");
    if (editingId) {
        await updateDoc(doc(db, "foods", editingId), { name: newName, desc: newDesc });
        setEditingId(null);
    } else {
        await addDoc(collection(db, "foods"), { name: newName, desc: newDesc });
    }
    setNewName(""); setNewDesc(""); 
  };

  const startEdit = (food) => {
      setNewName(food.name); setNewDesc(food.desc); setEditingId(food.id);
      document.getElementById('addForm').scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => { setNewName(""); setNewDesc(""); setEditingId(null); };
  
  const resetInitialDb = async () => {
    if(!confirm("Caricare DB base?")) return;
    INITIAL_DB.forEach(async (item) => await addDoc(collection(db, "foods"), item));
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(summary); alert("Copiato!"); };
  const handleNoteChange = (e) => { setNotes(e.target.value); updateDaily('notes', e.target.value); };
  
  const addNoteToDiary = () => { 
      const prevSum = summary;
      onRegisterUndo(() => { setSummary(prevSum); updateDaily('dailyDiary', prevSum); });

      let text = summary;
      if (text && !text.endsWith('\n')) text += '\n'; 
      text += notes + '\n'; 
      setSummary(text); 
      updateDaily('dailyDiary', text); 
  };

  const filteredDbList = foodDb.filter(f => f.name.toLowerCase().includes(dbSearch.toLowerCase()));

  return (
    <div className="fade-in">
      <h1>NutriSearch 🍎</h1>

      <div className="section">
        <select value={meal} onChange={(e) => setMeal(e.target.value)} className="meal-selector">
          <option value="COLAZIONE">☕ Colazione</option>
          <option value="PRANZO">🍝 Pranzo</option>
          <option value="CENA">🥗 Cena</option>
          <option value="SPUNTINO">🍎 Spuntino</option>
        </select>
      </div>

      <div className="section" style={{position: 'relative'}}>
        <input type="text" placeholder="Cerca alimento..." value={searchTerm} onChange={handleSearch} />
        {suggestions.length > 0 && (
          <div id="suggestions" style={{display:'block'}}>
            {suggestions.map(f => (
              <div key={f.id} className="suggestion-item" onClick={() => selectFood(f)}>{f.name}</div>
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
                <option value="cucchiaio">cucchiaio</option><option value="cucchiai">cucchiai</option>
                <option value="cucchiaino">cucchiaino</option><option value="cucchiaini">cucchiaini</option>
                <option value="mestolo">mestolo</option><option value="mestoli">mestoli</option>
              </select>
            </div>
            <button onClick={addToSummary} style={{background: 'var(--accent)'}}>Aggiungi al Diario ↓</button>
          </div>
        )}
      </div>

      <div className="section">
        <textarea id="finalSummary" rows="8" value={summary} onChange={(e) => { setSummary(e.target.value); updateDaily('dailyDiary', e.target.value); }} placeholder="Il diario apparirà qui..."></textarea>
        <div style={{display:'flex', gap:10, marginBottom: 20}}>
            <button onClick={copyToClipboard} style={{background: 'var(--text-main)'}}><Copy size={16}/> Copia</button>
            <button onClick={clearDiary} style={{background: 'var(--border)', color:'#555'}}><Trash2 size={16}/> Svuota</button>
        </div>

        <div className="notes-area">
            <h4>📝 Note Personali</h4>
            <textarea value={notes} onChange={handleNoteChange} placeholder="Scrivi qui note fisse..."></textarea>
            <div style={{display:'flex', gap:10, marginTop:5}}>
                <button onClick={addNoteToDiary} style={{background: '#f1c40f', color:'#333', fontSize:12}}>+ Al Diario</button>
                <button onClick={() => { setNewName("Nota"); setNewDesc(notes); setShowDbManager(true); document.getElementById('addForm').scrollIntoView(); }} style={{background: 'var(--primary)', fontSize:12}}>+ Crea DB</button>
                <button onClick={clearNotes} style={{background: 'var(--border)', color:'#555', width:'auto', padding:'0 10px'}}><Trash2 size={14}/></button>
            </div>
        </div>
      </div>

      <div style={{textAlign:'center'}}>
        <button className="toggle-btn" onClick={() => setShowDbManager(!showDbManager)}>⚙️ Gestisci Database</button>
      </div>

      {showDbManager && (
        <div className="section" style={{background:'var(--bg-app)', padding:15, borderRadius:10, marginTop:10, border:'1px solid var(--border)'}}>
            <h4 style={{margin:'0 0 10px 0', color:'var(--text-main)'}}>{editingId ? "Modifica" : "Aggiungi"}</h4>
            <div id="addForm">
                <input type="text" placeholder="Nome" value={newName} onChange={e => setNewName(e.target.value)} />
                <textarea rows="2" placeholder="Descrizione" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <div style={{display:'flex', gap:10}}>
                    <button onClick={handleSaveToDb} style={{background: editingId ? 'var(--accent)' : 'var(--primary)'}}>{editingId ? "Aggiorna" : "Salva nel Cloud"}</button>
                    {editingId && <button onClick={cancelEdit} style={{background:'var(--text-sec)'}}>Annulla</button>}
                </div>
            </div>
            <hr style={{margin:'20px 0', borderTop:'1px solid #eee'}}/>
            <input type="text" placeholder="🔍 Cerca..." value={dbSearch} onChange={e => setDbSearch(e.target.value)} style={{marginBottom:10, fontSize:13}}/>
            <div style={{marginTop:5, maxHeight:250, overflowY:'auto'}}>
                {filteredDbList.map(f => (
                    <div key={f.id} style={{display:'flex', justifyContent:'space-between', padding:10, borderBottom:'1px solid #eee', alignItems:'center'}}>
                        <span style={{fontSize:12, flex:1}}><b>{f.name}</b></span>
                        <div style={{display:'flex', gap:5}}>
                            <button onClick={() => startEdit(f)} style={{background:'var(--accent)', width:'auto', padding:'5px 10px'}}><Edit2 size={14}/></button>
                            <button onClick={() => deleteFromDb(f.id)} style={{background:'var(--danger)', width:'auto', padding:'5px 10px'}}><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={resetInitialDb} style={{background:'var(--border)', color:'#333', fontSize:11, marginTop:20}}>⚠️ Carica DB Base</button>
        </div>
      )}
    </div>
  );
}
