import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState({ users: [], roles: [], permissions: [] });
  const [editingItem, setEditingItem] = useState(null);

  const authHeader = { 
    'Authorization': `Basic ${user?.authData}`, 
    'Content-Type': 'application/json' 
  };

  const fetchData = async () => {
    try {
      const [u, r, p] = await Promise.all([
        fetch(`${apiUrl}/admin/users`, { headers: authHeader }).then(res => res.json()),
        fetch(`${apiUrl}/admin/roles`, { headers: authHeader }).then(res => res.json()),
        fetch(`${apiUrl}/admin/permissions`, { headers: authHeader }).then(res => res.json())
      ]);
      setData({ users: u, roles: r, permissions: p });
    } catch (err) { console.error("Datu ielādes kļūda", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    
    let payload = { ...editingItem };
    if (activeTab === 'users' && payload.enabled === undefined) {
        payload.enabled = true;
    }

    try {
      const response = await fetch(`${apiUrl}/admin/${activeTab}`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setEditingItem(null);
        fetchData();
      } else {
        const errorText = await response.text();
        console.error("Servera kļūda:", errorText);
        alert("Kļūda: " + response.status);
      }
    } catch (err) { alert("Saglabāšanas kļūda"); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Vai tiešām vēlaties dzēst šo ierakstu?")) return;
    await fetch(`${apiUrl}/admin/${type}/${id}`, { method: 'DELETE', headers: authHeader });
    fetchData();
  };

  const startAddingNew = () => {
    if (activeTab === 'users') {
      setEditingItem({ username: '', password: '', enabled: true, roles: [] });
    } else if (activeTab === 'roles') {
      setEditingItem({ name: '', permissions: [] });
    } else {
      setEditingItem({ name: '' });
    }
  };

  const toggleRole = (role) => {
    const currentRoles = editingItem.roles || [];
    const exists = currentRoles.find(r => r.id === role.id);
    const newRoles = exists 
      ? currentRoles.filter(r => r.id !== role.id) 
      : [...currentRoles, role];
    setEditingItem({ ...editingItem, roles: newRoles });
  };

  const togglePermission = (perm) => {
    const currentPerms = editingItem.permissions || [];
    const exists = currentPerms.find(p => p.id === perm.id);
    const newPerms = exists 
      ? currentPerms.filter(p => p.id !== perm.id) 
      : [...currentPerms, perm];
    setEditingItem({ ...editingItem, permissions: newPerms });
  };

  const styles = {
    container: { padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif', color: '#333' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    tabBar: { display: 'flex', gap: '5px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    tabButton: (active) => ({
      padding: '10px 25px', cursor: 'pointer', border: 'none', borderRadius: '8px',
      backgroundColor: active ? '#4f46e5' : 'transparent', color: active ? '#fff' : '#666',
      fontWeight: '600', transition: '0.3s'
    }),
    card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '30px', border: '1px solid #f0f0f0' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '10px', width: '100%', boxSizing: 'border-box' },
    checkboxGroup: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #eee', color: '#666', fontSize: '0.85rem', textTransform: 'uppercase' },
    td: { padding: '12px', borderBottom: '1px solid #f0f0f0' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: '#e0e7ff', color: '#4338ca', marginRight: '5px' },
    btnSave: { backgroundColor: '#10b981', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    btnDelete: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Administrēšana</h1>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' }}>Atpakaļ</button>
      </div>

      <div style={styles.tabBar}>
        {['users', 'roles', 'permissions'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setEditingItem(null); }} style={styles.tabButton(activeTab === tab)}>
            {tab === 'users' ? 'Lietotāji' : tab === 'roles' ? 'Lomas' : 'Tiesības'}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>{editingItem?.id ? 'Labot ierakstu' : 'Pievienot jaunu'}</h3>
        <form onSubmit={handleSave}>
          {activeTab === 'users' && (
            <>
              <div style={{ display: 'flex', gap: '15px' }}>
                <input style={styles.input} placeholder="Lietotājvārds" value={editingItem?.username || ''} onChange={e => setEditingItem({...editingItem, username: e.target.value})} required />
                <input style={styles.input} type="password" placeholder={editingItem?.id ? "Parole (atstāj tukšu, ja nemaina)" : "Parole"} onChange={e => setEditingItem({...editingItem, password: e.target.value})} required={!editingItem?.id} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input type="checkbox" checked={editingItem?.enabled ?? true} onChange={e => setEditingItem({...editingItem, enabled: e.target.checked})} /> Aktīvs lietotājs
              </label>
              
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>Piešķirtās lomas:</p>
              <div style={styles.checkboxGroup}>
                {data.roles.map(role => (
                  <label key={role.id} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editingItem?.roles?.some(r => r.id === role.id) || false} onChange={() => toggleRole(role)} /> {role.name}
                  </label>
                ))}
              </div>
            </>
          )}

          {activeTab === 'roles' && (
            <>
              <input style={styles.input} placeholder="Lomas nosaukums (piem., ROLE_MANAGER)" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>Lomas tiesības (Permissions):</p>
              <div style={styles.checkboxGroup}>
                {data.permissions.map(perm => (
                  <label key={perm.id} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={editingItem?.permissions?.some(p => p.id === perm.id) || false} onChange={() => togglePermission(perm)} /> {perm.name}
                  </label>
                ))}
              </div>
            </>
          )}

          {activeTab === 'permissions' && (
            <input style={styles.input} placeholder="Tiesības nosaukums (piem., BRICK_DELETE)" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} required />
          )}

          <div style={{ marginTop: '20px' }}>
            <button type="submit" style={styles.btnSave}>Saglabāt</button>
            {editingItem && <button type="button" onClick={() => setEditingItem(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>Atcelt</button>}
          </div>
        </form>
      </div>

      <div style={{ ...styles.card, padding: '0' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nosaukums / Lietotājs</th>
              {activeTab !== 'permissions' && <th style={styles.th}>{activeTab === 'users' ? 'Lomas' : 'Tiesības'}</th>}
              <th style={{ ...styles.th, textAlign: 'right' }}>Darbības</th>
            </tr>
          </thead>
          <tbody>
            {data[activeTab].map(item => (
              <tr key={item.id} className="table-row">
                <td style={styles.td}>{item.id}</td>
                <td style={styles.td}>
                  <span style={{ fontWeight: '600' }}>{item.username || item.name}</span>
                  {activeTab === 'users' && !item.enabled && <span style={{ marginLeft: '10px', color: 'red', fontSize: '0.7rem' }}>[BLOĶĒTS]</span>}
                </td>
                {activeTab !== 'permissions' && (
                  <td style={styles.td}>
                    {(activeTab === 'users' ? item.roles : item.permissions)?.map(sub => (
                      <span key={sub.id} style={styles.badge}>{sub.name}</span>
                    ))}
                  </td>
                )}
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <button onClick={() => setEditingItem(item)} style={{ border: '1px solid #ddd', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px' }}>Rediģēt</button>
                  <button onClick={() => handleDelete(activeTab, item.id)} style={styles.btnDelete}>Dzēst</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;