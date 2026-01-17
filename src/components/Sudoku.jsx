import React, { useState, useEffect } from 'react';

export default function Sudoku() {
  const [grid, setGrid] = useState([]);
  const [solution, setSolution] = useState([]);
  const [level, setLevel] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => { initGame(); }, []);

  const initGame = () => {
    const base = [[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],[2,3,1,5,6,4,8,9,7],[5,6,4,8,9,7,2,3,1],[8,9,7,2,3,1,5,6,4],[3,1,2,6,4,5,9,7,8],[6,4,5,9,7,8,3,1,2],[9,7,8,3,1,2,6,4,5]];
    // Semplice shuffle per demo
    let newSol = base.map(r => [...r]);
    // Rimuovi celle
    let newGrid = newSol.map(r => [...r]);
    let toRemove = 30 + Math.min(level, 20);
    for(let i=0; i<toRemove; i++) {
        let r = Math.floor(Math.random()*9), c = Math.floor(Math.random()*9);
        newGrid[r][c] = 0;
    }
    setSolution(newSol);
    setGrid(newGrid);
  };

  const handleInput = (num) => {
    if(!selected) return;
    const newGrid = [...grid];
    newGrid[selected.r][selected.c] = num;
    setGrid(newGrid);
  };

  const checkWin = () => {
    let win = true;
    for(let r=0; r<9; r++) for(let c=0; c<9; c++) if(grid[r][c] !== solution[r][c]) win = false;
    if(win) { alert("Vittoria!"); setLevel(l => l+1); initGame(); }
    else alert("Ci sono errori!");
  };

  return (
    <div className="fade-in" style={{textAlign:'center'}}>
      <h1 style={{color: '#4a90e2'}}>Sudoku 🎮</h1>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:10, fontWeight:'bold'}}>
        <span>Livello: {level}</span>
      </div>
      
      <div id="sudoku-grid">
        {grid.map((row, r) => row.map((cell, c) => (
            <div 
                key={`${r}-${c}`} 
                className={`cell ${cell !== 0 && solution[r][c]===cell ? 'fixed' : ''} ${selected?.r===r && selected?.c===c ? 'selected' : ''}`}
                onClick={() => setSelected({r,c})}
            >
                {cell !== 0 ? cell : ''}
            </div>
        )))}
      </div>

      <div className="sudoku-controls">
        {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} className="btn-digit" onClick={() => handleInput(n)}>{n}</button>
        ))}
        <button className="btn-digit" style={{background:'var(--danger)'}} onClick={() => handleInput(0)}>X</button>
      </div>
      
      <div style={{marginTop:15, display:'flex', gap:10}}>
        <button onClick={checkWin} style={{background:'#4a90e2'}}>Verifica</button>
        <button onClick={initGame} style={{background:'#95a5a6'}}>Nuovo</button>
      </div>
    </div>
  );
}
