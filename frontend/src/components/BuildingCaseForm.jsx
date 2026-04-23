import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingCaseVisualizer from './BuildingCaseVisualizer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';

const BuildingCaseForm = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const apiUrl = import.meta.env.VITE_API_URL;

  const canEdit = user?.roles?.includes('ROLE_ADMIN') || user?.permissions?.includes('BRICK_EDIT');

  const getAuthHeader = () => {
    return { 'Authorization': `Basic ${user?.authData}` };
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
    if (!canEdit) return;
    if (formData.windows.length >= 30) return alert("Maksimums ir 30 logi!");
    setFormData({
      ...formData,
      windows: [...formData.windows, { widthMm: 1000, heightMm: 1000, xMm: 0, yMm: 0 }]
    });
    setIsCalculated(false);
  };

  const removeWindow = (index) => {
    if (!canEdit) return;
    const newWindows = formData.windows.filter((_, i) => i !== index);
    setFormData({ ...formData, windows: newWindows });
    setIsCalculated(false);
  };

  const updateWindow = (index, field, value) => {
    if (!canEdit) return;
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
      if (!intersectsAny && w === blokaGarumsMm) wholeCount++;
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
  }, [apiUrl]);

  useEffect(() => {
    if (isEditMode) {
      fetch(`${apiUrl}/building-cases/${id}`, { headers: getAuthHeader() })
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
  }, [id, isEditMode, runCalculation]);

  const handleChange = (e) => {
    if (!canEdit) return;
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
    if (!canEdit) return alert("Jums nav tiesību saglabāt izmaiņas!");

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>{isEditMode ? t('edit_project') : t('new_project')}</h2>
          <LanguageSwitcher />
        </div>
        
        {!canEdit && (
          <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9em' }}>
            Jums ir tikai skatīšanās tiesības.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t('obj_address')}:</label>
            <input type="text" name="objektaAdrese" value={formData.objektaAdrese} onChange={handleChange} disabled={!canEdit} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t('wall_width')}:</label>
              <input type="number" name="sienasPlatumsMm" value={formData.sienasPlatumsMm} onChange={handleChange} disabled={!canEdit} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t('wall_height')}:</label>
              <input type="number" name="sienasAugstumsMm" value={formData.sienasAugstumsMm} onChange={handleChange} disabled={!canEdit} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
          </div>

          <div style={{ marginBottom: '25px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0 }}>{t('window_list')} ({formData.windows.length}/30)</h4>
              {canEdit && (
                <button type="button" onClick={addWindow} style={{ padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  {t('add_window')}
                </button>
              )}
            </div>

            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {formData.windows.map((win, index) => (
                <div key={index} onMouseEnter={() => setHoveredWindowIndex(index)} onMouseLeave={() => setHoveredWindowIndex(null)} style={{ padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #eee', backgroundColor: hoveredWindowIndex === index ? '#fffde7' : '#fcfcfc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold' }}>{t('window')} #{index + 1}</span>
                    {canEdit && <button type="button" onClick={() => removeWindow(index)} style={{ color: '#ff5252', border: 'none', background: 'none', cursor: 'pointer' }}>✖ {t('delete')}</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    <label>W: <input type="number" value={win.widthMm} onChange={(e) => updateWindow(index, 'widthMm', e.target.value)} disabled={!canEdit} style={{ width: '100%' }} /></label>
                    <label>H: <input type="number" value={win.heightMm} onChange={(e) => updateWindow(index, 'heightMm', e.target.value)} disabled={!canEdit} style={{ width: '100%' }} /></label>
                    <label>X: <input type="number" value={win.xMm} onChange={(e) => updateWindow(index, 'xMm', e.target.value)} disabled={!canEdit} style={{ width: '100%' }} /></label>
                    <label>Y: <input type="number" value={win.yMm} onChange={(e) => updateWindow(index, 'yMm', e.target.value)} disabled={!canEdit} style={{ width: '100%' }} /></label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <fieldset style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '10px', padding: '15px' }}>
            <legend style={{ padding: '0 10px', fontWeight: 'bold' }}>{t('block_params')}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <label>{t('block_h')}: <input type="number" name="blokaAugstumsMm" value={formData.blokaAugstumsMm} onChange={handleChange} disabled={!canEdit} style={{ width: '100%' }} /></label>
              <label>{t('block_l')}: <input type="number" name="blokaGarumsMm" value={formData.blokaGarumsMm} onChange={handleChange} disabled={!canEdit} style={{ width: '100%' }} /></label>
              <label>{t('block_w')}: <input type="number" name="blokaPlatumsMm" value={formData.blokaPlatumsMm} onChange={handleChange} disabled={!canEdit} style={{ width: '100%' }} /></label>
              <label>{t('block_o')}: <input type="number" name="blokaSuvesNobideMm" value={formData.blokaSuvesNobideMm} onChange={handleChange} disabled={!canEdit} style={{ width: '100%' }} /></label>
            </div>
          </fieldset>

          <button type="button" onClick={handleCalculateBtn} style={{ padding: '14px', width: '100%', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {t('calculate')}
          </button>

          <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
            {canEdit && (
              <button type="submit" disabled={!isCalculated} style={{ flex: 2, padding: '14px', backgroundColor: isCalculated ? '#4CAF50' : '#ccc', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                {t('save')}
              </button>
            )}
            <button type="button" onClick={() => navigate('/')} style={{ flex: 1, padding: '14px', backgroundColor: '#757575', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>

      <div style={{ flex: '1', position: 'sticky', top: '30px' }}>
        {isCalculated ? (
          <>
            <h3 style={{ marginTop: 0 }}>{t('wall_proj')}</h3>
            <BuildingCaseVisualizer data={formData} hoveredWindowIndex={hoveredWindowIndex} />
            <div style={{ marginTop: '20px', padding: '25px', backgroundColor: '#e3f2fd', borderLeft: '6px solid #1976D2', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>{t('summary')}</h4>
              <p>{t('total_blocks')}: <b>{formData.blokuSkaits}</b></p>
              <p>{t('full_blocks')}: <b>{formData.pilnieBloki}</b></p>
              <p style={{ color: '#d32f2f' }}>{t('cut_blocks')}: <b>{formData.sagrieztieBloki}</b></p>
            </div>
          </>
        ) : (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #bbb', borderRadius: '15px', color: '#777' }}>
            {t('press_calculate_1')}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingCaseForm;