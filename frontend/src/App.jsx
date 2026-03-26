import { useEffect, useState } from 'react';
import './App.css';
import BuildingCaseForm from './components/BuildingCaseForm';

function App() {
  return (
    <div className="App">
      <header style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Brick Calculator</h1>
      </header>

      <main style={{ padding: '20px' }}>
        {}
        <BuildingCaseForm />
      </main>
    </div>
  );
}

export default App;