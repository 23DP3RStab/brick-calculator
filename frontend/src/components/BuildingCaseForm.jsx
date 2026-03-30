import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildingCaseVisualizer from './BuildingCaseVisualizer';

const BuildingCaseForm = () => {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsCalculated(false); 
    setFormData({ 
      ...formData, 
      [name]: e.target.type === 'number' ? Number(value) : value 
    });
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const { sienasPlatumsMm, sienasAugstumsMm, blokaAugstumsMm, blokaGarumsMm, blokaPlatumsMm, blokaSuvesNobideMm } = formData;

    if (!sienasPlatumsMm || !sienasAugstumsMm) {
      alert("Lūdzu ievadiet sienas izmērus!");
      return;
    }

    const numRows = Math.ceil(sienasAugstumsMm / blokaAugstumsMm);
    let totalCount = 0;
    let wholeCount = 0;

    for (let r = 0; r < numRows; r++) {
      let x = 0;
      if (r === 0) {
        totalCount++;
        x = blokaPlatumsMm;
        const stopAt = sienasPlatumsMm - blokaPlatumsMm;
        while (x < stopAt) {
          const w = Math.min(blokaGarumsMm, stopAt - x);
          if (w === blokaGarumsMm) wholeCount++;
          totalCount++;
          x += w;
        }
        if (x < sienasPlatumsMm) totalCount++;
      } 
      else {
        if (r % 2 === 0) {
          totalCount++; 
          x = Math.min(blokaSuvesNobideMm, sienasPlatumsMm);
        }
        while (x < sienasPlatumsMm) {
          const w = Math.min(blokaGarumsMm, sienasPlatumsMm - x);
          if (w === blokaGarumsMm) wholeCount++;
          totalCount++;
          x += w;
        }
      }
    }

    setFormData(prev => ({ 
      ...prev, 
      blokuSkaits: totalCount, 
      pilnieBloki: wholeCount 
    }));
    setIsCalculated(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/building-cases`, {
        method: 'POST',
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
      
      {}
      <div style={{ flex: '0 0 500px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        <h2>Būvniecības lieta</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>Objekta adrese:</label>
            <input type="text" name="objektaAdrese" value={formData.objektaAdrese} onChange={handleChange} required style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label>Sienas platums (mm):</label>
              <input type="number" name="sienasPlatumsMm" value={formData.sienasPlatumsMm} onChange={handleChange} required />
            </div>
            <div>
              <label>Sienas augstums (mm):</label>
              <input type="number" name="sienasAugstumsMm" value={formData.sienasAugstumsMm} onChange={handleChange} required />
            </div>
          </div>

          <fieldset style={{ marginBottom: '10px' }}>
            <legend>Bloka parametri</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <label>Augstums (mm): <input type="number" name="blokaAugstumsMm" value={formData.blokaAugstumsMm} onChange={handleChange} /></label>
              <label>Garums (mm): <input type="number" name="blokaGarumsMm" value={formData.blokaGarumsMm} onChange={handleChange} /></label>
              <label>Platums (mm): <input type="number" name="blokaPlatumsMm" value={formData.blokaPlatumsMm} onChange={handleChange} /></label>
              <label>Min. nobīde (mm): <input type="number" name="blokaSuvesNobideMm" value={formData.blokaSuvesNobideMm} onChange={handleChange} /></label>
            </div>
          </fieldset>

          <button type="button" onClick={handleCalculate} style={{ padding: '10px', width: '100%', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Rēķināt
          </button>

          <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
            <button type="submit" disabled={!isCalculated} style={{ padding: '10px 20px', backgroundColor: isCalculated ? '#4CAF50' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: isCalculated ? 'pointer' : 'not-allowed' }}>
              Saglabāt
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Atcelt
            </button>
          </div>
        </form>
      </div>

      {}
      <div style={{ flex: '1' }}>
        {isCalculated ? (
          <>
            <h3 style={{ marginTop: 0 }}>Sienas vizualizācija (Melnas šuves)</h3>
            <BuildingCaseVisualizer data={formData} />

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f4f8', borderLeft: '5px solid #2196F3', borderRadius: '4px' }}>
              <strong>Informatīvais lauks:</strong>
              <p style={{ margin: '5px 0' }}>Kopējais bloku skaits: <b>{formData.blokuSkaits}</b></p>
              <p style={{ margin: '5px 0' }}>No tiem pilnie bloki ({formData.blokaGarumsMm}mm): <b>{formData.pilnieBloki}</b></p>
            </div>
          </>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc', borderRadius: '8px', color: '#999' }}>
            Nospiediet "Rēķināt", lai redzētu vizualizāciju un aprēķinus.
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingCaseForm;