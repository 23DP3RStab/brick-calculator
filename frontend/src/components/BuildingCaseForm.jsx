import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingCaseVisualizer from './BuildingCaseVisualizer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const BuildingCaseForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const apiUrl = import.meta.env.VITE_API_URL;

  const getAuthHeader = () => {
    const user = import.meta.env.VITE_API_AUTH_USER;
    const pass = import.meta.env.VITE_API_AUTH_PASS;
    return { 'Authorization': 'Basic ' + btoa(`${user}:${pass}`) };
  };

  const [isCalculated, setIsCalculated] = useState(false);
  const [hoveredWindowIndex, setHoveredWindowIndex] = useState(null);

  const [formData, setFormData] = useState({
    objektaAdrese: '',
    sienasPlatumsMm: '',
    sienasAugstumsMm: '',
    blokaAugstumsMm: 200,
    blokaGarumsMm: 600,
    blokaPlatumsMm: 300,
    blokaSuvesNobideMm: 100,
    blokuSkaits: 0,
    pilnieBloki: 0,
    sagrieztieBloki: 0,
    windows: []
  });

  const addWindow = () => {
    if (formData.windows.length >= 30) return alert(t('max_windows'));
    setFormData({
      ...formData,
      windows: [...formData.windows, { widthMm: 1000, heightMm: 1000, xMm: 0, yMm: 0 }]
    });
    setIsCalculated(false);
  };

  const removeWindow = (index) => {
    const newWindows = formData.windows.filter((_, i) => i !== index);
    setFormData({ ...formData, windows: newWindows });
    setIsCalculated(false);
  };

  const updateWindow = (index, field, value) => {
    const newWindows = [...formData.windows];
    newWindows[index][field] = Number(value);
    setFormData({ ...formData, windows: newWindows });
    setIsCalculated(false);
  };

  const runCalculation = useCallback((currentData) => {
    const { 
      sienasPlatumsMm, sienasAugstumsMm, blokaAugstumsMm, blokaGarumsMm, 
      blokaPlatumsMm, blokaSuvesNobideMm, windows 
    } = currentData;
    
    if (!sienasPlatumsMm || !sienasAugstumsMm) return null;

    let totalCount = 0;
    let wholeCount = 0;
    const numRows = Math.ceil(sienasAugstumsMm / blokaAugstumsMm);

    const checkBlock = (x, y, w, h) => {
      const blockRight = x + w;
      const blockBottom = y + h;

      let intersectsAny = false;
      let fullyInsideAny = false;

      for (let win of windows) {
        const winLeft = win.xMm;
        const winRight = win.xMm + win.widthMm;
        const winTop = sienasAugstumsMm - win.yMm - win.heightMm;
        const winBottom = sienasAugstumsMm - win.yMm;

        if (x >= winLeft && blockRight <= winRight && y >= winTop && blockBottom <= winBottom) {
          fullyInsideAny = true;
          break; 
        }

        if (x < winRight && blockRight > winLeft && y < winBottom && blockBottom > winTop) {
          intersectsAny = true;
        }
      }

      if (fullyInsideAny) return;

      totalCount++;
      if (!intersectsAny && w === blokaGarumsMm) {
        wholeCount++;
      }
    };

    for (let r = 0; r < numRows; r++) {
      const y = sienasAugstumsMm - (r + 1) * blokaAugstumsMm;
      let x = 0;
      if (r === 0) {
        checkBlock(0, y, blokaPlatumsMm, blokaAugstumsMm);
        x = blokaPlatumsMm;
        const stopAt = sienasPlatumsMm - blokaPlatumsMm;
        while (x < stopAt) {
          const w = Math.min(blokaGarumsMm, stopAt - x);
          checkBlock(x, y, w, blokaAugstumsMm);
          x += w;
        }
        if (x < sienasPlatumsMm) checkBlock(x, y, sienasPlatumsMm - x, blokaAugstumsMm);
      } else {
        if (r % 2 === 0) {
          const startW = Math.min(blokaSuvesNobideMm, sienasPlatumsMm);
          checkBlock(0, y, startW, blokaAugstumsMm);
          x = startW;
        }
        while (x < sienasPlatumsMm) {
          const w = Math.min(blokaGarumsMm, sienasPlatumsMm - x);
          checkBlock(x, y, w, blokaAugstumsMm);
          x += w;
        }
      }
    }
    return { totalCount, wholeCount, cutCount: totalCount - wholeCount };
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetch(`${apiUrl}/building-cases/${id}`, {
        headers: { ...getAuthHeader() }
      })
        .then(res => res.json())
        .then(data => {
          const results = runCalculation(data);
          setFormData({ 
            ...data, 
            windows: data.windows || [],
            pilnieBloki: results ? results.wholeCount : 0,
            sagrieztieBloki: results ? results.cutCount : 0
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
      setFormData(prev => ({ 
        ...prev, 
        blokuSkaits: results.totalCount, 
        pilnieBloki: results.wholeCount,
        sagrieztieBloki: results.cutCount 
      }));
      setIsCalculated(true);
    } else {
      alert(t('enter_dimensions'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `${apiUrl}/building-cases/${id}` : `${apiUrl}/building-cases`;
    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          ...getAuthHeader() 
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert(t('saved'));
        navigate('/');
      } else {
        alert(t('auth_error'));
      }
    } catch (error) {
      alert(t('error'));
    }
  };

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '30px', alignItems: 'flex-start', fontFamily: 'sans-serif' }}>
      
      <div style={{ flex: '0 0 550px', backgroundColor: '#fdfdfd', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #eee' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>{isEditMode ? t('edit_project') : t('new_project')}</h2>
        <LanguageSwitcher />
        
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t('obj_address')}:</label>
            <input type="text" name="objektaAdrese" value={formData.objektaAdrese} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t('wall_width')}:</label>
              <input type="number" name="sienasPlatumsMm" value={formData.sienasPlatumsMm} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t('wall_height')}:</label>
              <input type="number" name="sienasAugstumsMm" value={formData.sienasAugstumsMm} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
          </div>

          <div style={{ marginBottom: '25px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0 }}>{t('window_list')} ({formData.windows.length}/30)</h4>
              <button type="button" onClick={addWindow} style={{ padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.85em' }}>
                {t('add_window')}
              </button>
            </div>

            <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
              {formData.windows.length === 0 && <p style={{ fontSize: '0.9em', color: '#999', textAlign: 'center' }}>{t('no_windows')}</p>}
              {formData.windows.map((win, index) => (
                <div 
                  key={index} 
                  onMouseEnter={() => setHoveredWindowIndex(index)}
                  onMouseLeave={() => setHoveredWindowIndex(null)}
                  style={{ 
                    padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee', 
                    backgroundColor: hoveredWindowIndex === index ? '#fffde7' : '#fcfcfc',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{t('window')} #{index + 1}</span>
                    <button type="button" onClick={() => removeWindow(index)} style={{ color: '#ff5252', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✖ {t('delete')}</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    <label style={{ fontSize: '0.75em' }}>W: <input type="number" value={win.widthMm} onChange={(e) => updateWindow(index, 'widthMm', e.target.value)} style={{ width: '100%' }} /></label>
                    <label style={{ fontSize: '0.75em' }}>H: <input type="number" value={win.heightMm} onChange={(e) => updateWindow(index, 'heightMm', e.target.value)} style={{ width: '100%' }} /></label>
                    <label style={{ fontSize: '0.75em' }}>X: <input type="number" value={win.xMm} onChange={(e) => updateWindow(index, 'xMm', e.target.value)} style={{ width: '100%' }} /></label>
                    <label style={{ fontSize: '0.75em' }}>Y: <input type="number" value={win.yMm} onChange={(e) => updateWindow(index, 'yMm', e.target.value)} style={{ width: '100%' }} /></label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <fieldset style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '10px', padding: '15px' }}>
            <legend style={{ padding: '0 10px', fontWeight: 'bold', color: '#666' }}>{t('block_params')}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label style={{ fontSize: '0.9em' }}>{t('block_h')}:</label>
              <input type="number" name="blokaAugstumsMm" value={formData.blokaAugstumsMm} onChange={handleChange} style={{ width: '100%', marginTop: '4px' }} />
              <label style={{ fontSize: '0.9em' }}>{t('block_l')}:</label>
              <input type="number" name="blokaGarumsMm" value={formData.blokaGarumsMm} onChange={handleChange} style={{ width: '100%', marginTop: '4px' }} />
              <label style={{ fontSize: '0.9em' }}>{t('block_w')}:</label>
              <input type="number" name="blokaPlatumsMm" value={formData.blokaPlatumsMm} onChange={handleChange} style={{ width: '100%', marginTop: '4px' }} />
              <label style={{ fontSize: '0.9em' }}>{t('block_o')}:</label>
              <input type="number" name="blokaSuvesNobideMm" value={formData.blokaSuvesNobideMm} onChange={handleChange} style={{ width: '100%', marginTop: '4px' }} />
            </div>
          </fieldset>

          <button type="button" onClick={handleCalculateBtn} style={{ padding: '14px', width: '100%', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em' }}>
            {t('calculate')}
          </button>

          <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={!isCalculated} style={{ flex: 2, padding: '14px', backgroundColor: isCalculated ? '#4CAF50' : '#ccc', color: 'white', border: 'none', borderRadius: '8px', cursor: isCalculated ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
              {t('save')}
            </button>
            <button type="button" onClick={() => navigate('/')} style={{ flex: 1, padding: '14px', backgroundColor: '#757575', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>

      <div style={{ flex: '1', position: 'sticky', top: '30px' }}>
        {isCalculated ? (
          <>
            <h3 style={{ marginTop: 0, color: '#333' }}>{t('wall_proj')}</h3>
            <BuildingCaseVisualizer data={formData} hoveredWindowIndex={hoveredWindowIndex} />
            <div style={{ marginTop: '20px', padding: '25px', backgroundColor: '#e3f2fd', borderLeft: '6px solid #1976D2', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1976D2' }}>{t('summary')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <p style={{ margin: 0 }}>{t('total_blocks')}: <b>{formData.blokuSkaits}</b></p>
                <p style={{ margin: 0 }}>{t('full_blocks')}: <b>{formData.pilnieBloki}</b></p>
                <p style={{ margin: 0, color: '#d32f2f' }}>{t('cut_blocks')}: <b>{formData.sagrieztieBloki}</b></p>
                <p style={{ margin: 0 }}>{t('window_list')}: <b>{formData.windows.length}</b></p>
              </div>
            </div>
          </>
        ) : (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #bbb', borderRadius: '15px', color: '#777', backgroundColor: '#fcfcfc', textAlign: 'center', padding: '40px' }}>
            <div>
              <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{t('visualization_ready')}</p>
              <p>{t('press_calculate_1')}<br/> {t('press_calculate_2')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingCaseForm;