import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    blokuSkaits: 0
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
    const { sienasPlatumsMm, sienasAugstumsMm, blokaAugstumsMm, blokaGarumsMm, blokaPlatumsMm } = formData;

    if (!sienasPlatumsMm || !sienasAugstumsMm) {
      alert("Lūdzu ievadiet sienas izmērus!");
      return;
    }

    const numRows = Math.ceil(sienasAugstumsMm / blokaAugstumsMm);
    let totalBlocks = 0;

    for (let r = 1; r <= numRows; r++) {
      if (r === 1) {
        const edgeSpace = 2 * blokaPlatumsMm;
        const middleSpace = sienasPlatumsMm - edgeSpace;
        const middleBlocks = middleSpace > 0 ? Math.ceil(middleSpace / blokaGarumsMm) : 0;
        totalBlocks += (2 + middleBlocks);
      } else {
        totalBlocks += Math.ceil(sienasPlatumsMm / blokaGarumsMm);
      }
    }

    setFormData(prev => ({ ...prev, blokuSkaits: totalBlocks }));
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
        alert('Dati un aprēķini saglabāti!');
        navigate('/');
      }
    } catch (error) {
      alert("Kļūda saglabājot datus.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', fontFamily: 'sans-serif' }}>
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

        {}
        <button type="button" onClick={handleCalculate} style={{ padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Rēķināt
        </button>

        {}
        {isCalculated && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f4f8', borderLeft: '5px solid #2196F3' }}>
            <strong>Informatīvais lauks:</strong>
            <p style={{ fontSize: '1.2em', margin: '5px 0' }}>
              Nepieciešamais bloku skaits: <span style={{ color: '#d32f2f' }}>{formData.blokuSkaits}</span>
            </p>
          </div>
        )}

        <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          {}
          <button 
            type="submit" 
            disabled={!isCalculated}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: isCalculated ? '#4CAF50' : '#ccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isCalculated ? 'pointer' : 'not-allowed' 
            }}
          >
            Saglabāt
          </button>

          {}
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Atcelt
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuildingCaseForm;