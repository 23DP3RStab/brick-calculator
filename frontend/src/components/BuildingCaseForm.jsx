import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingCaseVisualizer from './BuildingCaseVisualizer';

const BuildingCaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const apiUrl = import.meta.env.VITE_API_URL;

  const [isCalculated, setIsCalculated] = useState(false);
  const [formData, setFormData] = useState({
    objektaAdrese: '',
    sienasPlatumsMm: '',
    sienasAugstumsMm: '',
    blokaAugstumsMm: 200,
    blokaGarumsMm: 600,
    blokaPlatumsMm: 300,
    blokaSuvesNobideMm: 100,
    blokuSkaits: 0,
    pilnieBloki: 0
  });

  const runCalculation = useCallback((currentData) => {
    const { sienasPlatumsMm, sienasAugstumsMm, blokaAugstumsMm, blokaGarumsMm, blokaPlatumsMm, blokaSuvesNobideMm } = currentData;
    if (!sienasPlatumsMm || !sienasAugstumsMm) return null;

    const numRows = Math.ceil(sienasAugstumsMm / blokaAugstumsMm);
    let totalCount = 0;
    let wholeCount = 0;

    for (let r = 0; r < numRows; r++) {
      let x = 0;
      if (r === 0) {
        totalCount++; x = blokaPlatumsMm;
        const stopAt = sienasPlatumsMm - blokaPlatumsMm;
        while (x < stopAt) {
          const w = Math.min(blokaGarumsMm, stopAt - x);
          if (w === blokaGarumsMm) wholeCount++;
          totalCount++; x += w;
        }
        if (x < sienasPlatumsMm) totalCount++;
      } else {
        if (r % 2 === 0) { totalCount++; x = Math.min(blokaSuvesNobideMm, sienasPlatumsMm); }
        while (x < sienasPlatumsMm) {
          const w = Math.min(blokaGarumsMm, sienasPlatumsMm - x);
          if (w === blokaGarumsMm) wholeCount++;
          totalCount++; x += w;
        }
      }
    }
    return { totalCount, wholeCount };
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetch(`${apiUrl}/building-cases/${id}`)
        .then(res => res.json())
        .then(data => {
          const results = runCalculation(data);
          setFormData({ 
            ...data, 
            pilnieBloki: results ? results.wholeCount : 0 
          });
          setIsCalculated(true);
        })
        .catch(err => console.error("Error loading case:", err));
    }
  }, [id, isEditMode, apiUrl, runCalculation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsCalculated(false); 
    setFormData({ ...formData, [name]: e.target.type === 'number' ? Number(value) : value });
  };

  const handleCalculateBtn = (e) => {
    e.preventDefault();
    const results = runCalculation(formData);
    if (results) {
      setFormData(prev => ({ ...prev, blokuSkaits: results.totalCount, pilnieBloki: results.wholeCount }));
      setIsCalculated(true);
    } else {
      alert("Lūdzu ievadiet sienas izmērus!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `${apiUrl}/building-cases/${id}` : `${apiUrl}/building-cases`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Dati saglabāti!');
        navigate('/');
      }
    } catch (error) {
      alert("Kļūda saglabājot.");
    }
  };

  return (
    <div style={{ display: 'flex', gap: '40px', padding: '40px', alignItems: 'flex-start' }}>
      <div style={{ flex: '0 0 500px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginBottom: '20px' }}>{isEditMode ? 'Labot lietu' : 'Jauna lieta'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Objekta adrese:</label>
            <input type="text" name="objektaAdrese" value={formData.objektaAdrese} onChange={handleChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Platums (mm):</label>
              <input type="number" name="sienasPlatumsMm" value={formData.sienasPlatumsMm} onChange={handleChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Augstums (mm):</label>
              <input type="number" name="sienasAugstumsMm" value={formData.sienasAugstumsMm} onChange={handleChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <fieldset style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>Bloka parametri</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label>Augstums (mm): <input type="number" name="blokaAugstumsMm" value={formData.blokaAugstumsMm} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} /></label>
              <label>Garums (mm): <input type="number" name="blokaGarumsMm" value={formData.blokaGarumsMm} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} /></label>
              <label>Platums (mm): <input type="number" name="blokaPlatumsMm" value={formData.blokaPlatumsMm} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} /></label>
              <label>Nobīde (mm): <input type="number" name="blokaSuvesNobideMm" value={formData.blokaSuvesNobideMm} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} /></label>
            </div>
          </fieldset>

          <button type="button" onClick={handleCalculateBtn} style={{ padding: '12px', width: '100%', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Pārrēķināt
          </button>

          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={!isCalculated} style={{ flex: 2, padding: '12px', backgroundColor: isCalculated ? '#4CAF50' : '#ccc', color: 'white', border: 'none', borderRadius: '6px', cursor: isCalculated ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
              Saglabāt
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ flex: 1, padding: '12px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Atcelt
            </button>
          </div>
        </form>
      </div>

      <div style={{ flex: '1' }}>
        {isCalculated ? (
          <>
            <h3 style={{ marginTop: 0 }}>Sienas vizualizācija</h3>
            <BuildingCaseVisualizer data={formData} />
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e3f2fd', borderLeft: '6px solid #2196F3', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Informatīvais lauks:</h4>
              <p style={{ margin: '5px 0', fontSize: '1.1em' }}>Kopējais bloku skaits: <b>{formData.blokuSkaits}</b></p>
              <p style={{ margin: '5px 0', fontSize: '1.1em' }}>No tiem pilnie bloki: <b>{formData.pilnieBloki}</b></p>
            </div>
          </>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc', borderRadius: '12px', color: '#999', textAlign: 'center', padding: '20px' }}>
            Mainiet datus vai spiediet "Rēķināt", <br /> lai redzētu vizualizāciju un aprēķinus.
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingCaseForm;