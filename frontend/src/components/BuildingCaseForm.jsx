import { useState } from 'react';

const BuildingCaseForm = () => {
  const [formData, setFormData] = useState({
    objektaAdrese: '',
    sienasPlatumsMm: '',
    sienasAugstumsMm: '',
    blokaAugstumsMm: 200,
    blokaGarumsMm: 600,
    blokaPlatumsMm: 300,
    blokaSuvesNobideMm: 100
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${apiUrl}/building-cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Dati veiksmīgi saglabāti!');
      } else {
        alert('Kļūda saglabājot datus.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Nevarēja savienoties ar serveri.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>Jauns Objekts</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Adrese:</label>
          <input type="text" name="objektaAdrese" value={formData.objektaAdrese} onChange={handleChange} required />
        </div>
        
        <div>
          <label>Sienas Platums (mm):</label>
          <input type="number" name="sienasPlatumsMm" value={formData.sienasPlatumsMm} onChange={handleChange} required />
        </div>

        <div>
          <label>Sienas Augstums (mm):</label>
          <input type="number" name="sienasAugstumsMm" value={formData.sienasAugstumsMm} onChange={handleChange} required />
        </div>

        <h4>Bloka parametri (pēc noklusējuma)</h4>

        <div>
          <label>Bloka Augstums (mm):</label>
          <input type="number" name="blokaAugstumsMm" value={formData.blokaAugstumsMm} onChange={handleChange} />
        </div>

        <div>
          <label>Bloka Garums (mm):</label>
          <input type="number" name="blokaGarumsMm" value={formData.blokaGarumsMm} onChange={handleChange} />
        </div>

        <button type="submit" style={{ marginTop: '20px' }}>Saglabāt Datubāzē</button>
      </form>
    </div>
  );
};

export default BuildingCaseForm;