import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchCases = () => {
    fetch(`${apiUrl}/building-cases`)
      .then(res => res.json())
      .then(data => setCases(data))
      .catch(err => console.error("Error fetching cases:", err));
  };

  useEffect(() => { fetchCases(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Vai tiešām vēlaties dzēst šo lietu?")) {
      try {
        const res = await fetch(`${apiUrl}/building-cases/${id}`, { method: 'DELETE' });
        if (res.ok) setCases(cases.filter(c => c.id !== id));
      } catch (err) { alert("Kļūda dzēšot."); }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333' }}>Būvniecības projekti</h1>
        <button onClick={() => navigate('/new')} style={{ padding: '12px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)' }}>
          + Jauns projekts
        </button>
      </div>

      <div style={{ display: 'flex', padding: '0 20px', marginBottom: '10px', color: '#888', fontSize: '0.9em', fontWeight: 'bold' }}>
        <div style={{ flex: 1 }}>ADRESE</div>
        <div style={{ width: '150px' }}>PLATUMS</div>
        <div style={{ width: '150px' }}>AUGSTUMS</div>
        <div style={{ width: '100px' }}>BLOKI</div>
        <div style={{ width: '180px', textAlign: 'right' }}>DARBĪBAS</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {cases.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee', transition: 'transform 0.2s' }}>
            
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2c3e50' }}>{c.objektaAdrese}</div>
              <div style={{ fontSize: '0.8em', color: '#aaa', marginTop: '4px' }}>ID: #{c.id}</div>
            </div>

            <div style={{ width: '150px', color: '#555' }}>{c.sienasPlatumsMm} mm</div>
            <div style={{ width: '150px', color: '#555' }}>{c.sienasAugstumsMm} mm</div>
            
            <div style={{ width: '100px' }}>
              <span style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9em' }}>
                {c.blokuSkaits}
              </span>
            </div>

            <div style={{ width: '180px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => navigate(`/edit/${c.id}`)}
                style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#2196F3', border: '1px solid #2196F3', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Labot
              </button>
              <button 
                onClick={() => handleDelete(c.id)}
                style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#f44336', border: '1px solid #f44336', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Dzēst
              </button>
            </div>
          </div>
        ))}

        {cases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#aaa', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
            Nav atrastu būvniecības lietu.
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;