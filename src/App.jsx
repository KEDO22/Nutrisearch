import React, { useState, useEffect } from 'react';
import WaterTracker from './components/WaterTracker';
import FoodDiary from './components/FoodDiary';
import History from './components/History';
import Sudoku from './components/Sudoku';
import { Droplets, Utensils, BookOpen, Gamepad2, Moon, Sun, Heart } from 'lucide-react';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('food');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // NUOVO: Stato per il popup di benvenuto
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // NUOVO: Effetto per nascondere il popup automaticamente dopo 4 secondi
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000); // 4000 ms = 4 secondi
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="app-container">
      
      {/* --- POPUP IAGO --- */}
      {showWelcome && (
        <div className="welcome-overlay" onClick={() => setShowWelcome(false)}>
          <div className="welcome-box">
            <Heart size={50} color="#e74c3c" fill="#e74c3c" style={{marginBottom:10}} />
            <h2>Ciao Iago!</h2>
            <p>Ti vogliamo tanto<br/>tanto bene ❤️</p>
          </div>
        </div>
      )}
      {/* ------------------ */}

      <div className="header-actions">
        <button onClick={toggleTheme} className="icon-btn" title="Cambia tema">
          {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'food' && <FoodDiary />}
        {activeTab === 'water' && <WaterTracker />}
        {activeTab === 'history' && <History />}
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
    <button 
      className={`nav-item ${isActive ? activeClass : ''}`} 
      onClick={() => set(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
