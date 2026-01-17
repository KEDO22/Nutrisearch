import React, { useState, useEffect } from 'react';
import WaterTracker from './components/WaterTracker';
import FoodDiary from './components/FoodDiary';
// Importeremo poi History e Sudoku
import { Droplets, Utensils, BookOpen, Gamepad2, Moon, Sun } from 'lucide-react';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('food');
    const [theme, setTheme] = useState('light');

      // Gestione Tema
        useEffect(() => {
            document.body.setAttribute('data-theme', theme);
              }, [theme]);

                const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

                  return (
                      <div className="app-container">
                            {/* Header */}
                                  <div className="header-actions">
                                          <button onClick={toggleTheme} className="icon-btn">
                                                    {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
                                                            </button>
                                                                  </div>

                                                                        <div className="content-area">
                                                                                {/* Render condizionale: Mostra solo il componente attivo */}
                                                                                        {activeTab === 'food' && <FoodDiary />}
                                                                                                {activeTab === 'water' && <WaterTracker />}
                                                                                                        {activeTab === 'history' && <div className="placeholder">Storico in arrivo...</div>}
                                                                                                                {activeTab === 'game' && <div className="placeholder">Sudoku in arrivo...</div>}
                                                                                                                      </div>

                                                                                                                            {/* Navigation Bar */}
                                                                                                                                  <nav className="bottom-nav">
                                                                                                                                          <NavButton id="food" icon={<Utensils/>} label="Diario" active={activeTab} set={setActiveTab} />
                                                                                                                                                  <NavButton id="water" icon={<Droplets/>} label="Acqua" active={activeTab} set={setActiveTab} />
                                                                                                                                                          <NavButton id="history" icon={<BookOpen/>} label="Storico" active={activeTab} set={setActiveTab} />
                                                                                                                                                                  <NavButton id="game" icon={<Gamepad2/>} label="Svago" active={activeTab} set={setActiveTab} />
                                                                                                                                                                        </nav>
                                                                                                                                                                            </div>
                                                                                                                                                                              );
                                                                                                                                                                              }

                                                                                                                                                                              // Un piccolo componente per i bottoni della navbar per non ripetere codice
                                                                                                                                                                              function NavButton({ id, icon, label, active, set }) {
                                                                                                                                                                                return (
                                                                                                                                                                                    <button 
                                                                                                                                                                                          className={`nav-item ${active === id ? 'active' : ''}`} 
                                                                                                                                                                                                onClick={() => set(id)}
                                                                                                                                                                                                    >
                                                                                                                                                                                                          {icon}
                                                                                                                                                                                                                <span>{label}</span>
                                                                                                                                                                                                                    </button>
                                                                                                                                                                                                                      );
                                                                                                                                                                                                                      }
                                                                                                                                                                                                                      