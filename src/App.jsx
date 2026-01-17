import React, { useState, useEffect } from 'react';
import WaterTracker from './components/WaterTracker';
import FoodDiary from './components/FoodDiary';
import History from './components/History';
import Sudoku from './components/Sudoku';
import { Droplets, Utensils, BookOpen, Gamepad2, Moon, Sun } from 'lucide-react';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('food');
  // Legge il tema salvato o usa 'light' di default
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Gestione Tema
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="app-container">
      {/* Header con bottone tema */}
      <div className="header-actions">
        <button onClick={toggleTheme} className="icon-btn" title="Cambia tema">
          {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
        </button>
      </div>

      {/* Area Contenuto: Qui vengono mostrati i componenti reali */}
      <div className="content-area">
        {activeTab === 'food' && <FoodDiary />}
        {activeTab === 'water' && <WaterTracker />}
        {activeTab === 'history' && <History />}
        {activeTab === 'game' && <Sudoku />}
      </div>

      {/* Navigation Bar in basso */}
      <nav className="bottom-nav">
        <NavButton 
          id="food" 
          icon={<Utensils size={20}/>} 
          label="Diario" 
          active={activeTab} 
          set={setActiveTab} 
        />
        <NavButton 
          id="water" 
          icon={<Droplets size={20}/>} 
          label="Acqua" 
          active={activeTab} 
          set={setActiveTab} 
        />
        <NavButton 
          id="history" 
          icon={<BookOpen size={20}/>} 
          label="Storico" 
          active={activeTab} 
          set={setActiveTab} 
        />
        <NavButton 
          id="game" 
          icon={<Gamepad2 size={20}/>} 
          label="Svago" 
          active={activeTab} 
          set={setActiveTab} 
        />
      </nav>
    </div>
  );
}

// Componente helper per i bottoni della navbar (per pulizia codice)
function NavButton({ id, icon, label, active, set }) {
  const isActive = active === id;
  // Classi dinamiche per colorare l'icona attiva
  let activeClass = '';
  if (isActive) {
    if (id === 'water') activeClass = 'active-water';
    else if (id === 'history') activeClass = 'active-history';
    else if (id === 'game') activeClass = 'active-game';
    else activeClass = 'active';
  }

  return (
    <button 
      className={`nav-item ${isActive ? activeClass : ''}`} 
      onClick={() => set(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
