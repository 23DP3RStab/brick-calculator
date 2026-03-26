import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/building-cases`)
      .then(res => res.json())
      .then(data => setCases(data))
      .catch(err => console.error("Error fetching cases:", err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Būvniecības lietas</h2>
        <button onClick={() => navigate('/new')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          + Jauna būvniecības lieta
        </button>
      </div>

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>ID</th>
            <th>Adrese</th>
            <th>Sienas platums (mm)</th>
            <th>Sienas augstums (mm)</th>
            <th>Bloku skaits sienā</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.objektaAdrese}</td>
              <td>{c.sienasPlatumsMm}</td>
              <td>{c.sienasAugstumsMm}</td>
              <td>{c.blokuSkaits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseList;