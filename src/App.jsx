import React, { useState, useEffect } from 'react';
import WaterTracker from './components/WaterTracker';
import FoodDiary from './components/FoodDiary';
import History from './components/History';
import Sudoku from './components/Sudoku';
import { Droplets, Utensils, BookOpen, Gamepad2, Moon, Sun, RotateCcw } from 'lucide-react';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('food');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // STATO PER L'UNDO GLOBALE
  // undoAction conterrà la funzione da eseguire per annullare
  const [undoAction, setUndoAction] = useState(null);

  // Gestione Tema
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Timer per nascondere il tasto Undo dopo 15 secondi se non usato
  useEffect(() => {
    if (undoAction) {
      const timer = setTimeout(() => setUndoAction(null), 15000);
      return () => clearTimeout(timer);
    }
  }, [undoAction]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Funzione che i componenti figli chiameranno per registrare un'azione annullabile
  const registerUndo = (restoreFunction) => {
    // restoreFunction deve essere una funzione che, se chiamata, ripristina lo stato
    setUndoAction(() => restoreFunction);
  };

  const executeUndo = () => {
    if (undoAction) {
      undoAction(); // Esegue il ripristino
      setUndoAction(null); // Nasconde il tasto
    }
  };

  return (
    <div className="app-container">
      
      {/* HEADER: Tasti Undo e Tema affiancati */}
      <div className="header-actions" style={{display:'flex', gap:'10px', alignItems:'center', justifyContent:'flex-end'}}>
        
        {/* Tasto UNDO: appare solo se c'è qualcosa da annullare e NON siamo in Acqua */}
        {undoAction && activeTab !== 'water' && (
          <button 
            onClick={executeUndo} 
            className="icon-btn fade-in" 
            title="Annulla ultima azione"
            style={{borderColor: 'var(--text-main)', color: 'var(--text-main)'}}
          >
            <RotateCcw size={20} />
          </button>
        )}

        <button onClick={toggleTheme} className="icon-btn" title="Cambia tema">
          {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
        </button>
      </div>

      <div className="content-area">
        {/* Passiamo la funzione registerUndo ai componenti che ne hanno bisogno */}
        {activeTab === 'food' && <FoodDiary onRegisterUndo={registerUndo} />}
        {activeTab === 'water' && <WaterTracker />} 
        {activeTab === 'history' && <History onRegisterUndo={registerUndo} />}
        {activeTab === 'game' && <Sudoku />}
      </div>

      <nav className="bottom-nav">
        <NavButton id="food" icon={<Utensils size={20}/>} label="Diario" active={activeTab} set={setActiveTab} />
        <NavButton id="water" icon={<Droplets size={20}/>} label="Acqua" active={activeTab} set={setActiveTab} />
        <NavButton id="history" icon={<BookOpen size={20}/>} label="Storico" active={activeTab} set={setActiveTab} />
        <NavButton id="game" icon={<Gamepad2 size={20}/>} label="Svago" active={activeTab} set={setActiveTab} />
      </nav>
    </div>
  );
}

function NavButton({ id, icon, label, active, set }) {
  const isActive = active === id;
  let activeClass = '';
  if (isActive) {
    if (id === 'water') activeClass = 'active-water';
    else if (id === 'history') activeClass = 'active-history';
    else if (id === 'game') activeClass = 'active-game';
    else activeClass = 'active';
  }

  return (
    <button className={`nav-item ${isActive ? activeClass : ''}`} onClick={() => set(id)}>
      {icon} <span>{label}</span>
    </button>
  );
}
