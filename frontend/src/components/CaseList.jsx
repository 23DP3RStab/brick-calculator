import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Roboto' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10, fontSize: 12 },
  label: { fontWeight: 'bold' },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0, marginTop: 10 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 5, fontSize: 10 }
});

const BuildingCasePDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>ID: {data.id}</Text>
        <Text>Adrese: {data.objektaAdrese}</Text>
      </View>
      <View style={styles.section}>
        <Text>Sienas izmēri: {data.sienasPlatumsMm}x{data.sienasAugstumsMm} mm</Text>
        <Text>Bloku parametri: {data.blokaGarumsMm}x{data.blokaAugstumsMm} mm (Platums: {data.blokaPlatumsMm}mm)</Text>
      </View>
      <View style={styles.section}>
        <Text>Kopējais bloku skaits: {data.blokuSkaits}</Text>
        <Text>Veselo bloku skaits: {data.pilnieBloki}</Text>
        <Text>Griezto bloku skaits: {data.sagrieztieBloki}</Text>
      </View>
      
      <Text style={{ marginTop: 20, fontSize: 14 }}>Logi uz sienas ({data.windows?.length || 0}):</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Nr.</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Platums</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Augstums</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Pozīcija (X,Y)</Text></View>
        </View>
        {data.windows?.map((win, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{index + 1}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{win.widthMm} mm</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{win.heightMm} mm</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{win.xMm}, {win.yMm}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const CaseList = () => {
  const { t } = useTranslation();
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const getAuthHeader = () => {
    const user = import.meta.env.VITE_API_AUTH_USER;
    const pass = import.meta.env.VITE_API_AUTH_PASS;
    return { 'Authorization': 'Basic ' + btoa(`${user}:${pass}`) };
  };

  const fetchCases = () => {
    fetch(`${apiUrl}/building-cases`, {
      headers: { ...getAuthHeader() }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setCases(data))
      .catch(err => console.error("Error fetching cases:", err));
  };

  useEffect(() => { fetchCases(); }, []);

  const exportToExcel = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    
    const exportData = cases.map(c => ({
      'ID': c.id,
      'Objekta Adrese': c.objektaAdrese,
      'Sienas Platums (mm)': c.sienasPlatumsMm,
      'Sienas Augstums (mm)': c.sienasAugstumsMm,
      'Kopējais bloku skaits': c.blokuSkaits,
      'Pilnie bloki': c.pilnieBloki,
      'Sagrieztie bloki': c.sagrieztieBloki,
      'Logu skaits': c.windows?.length || 0
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = { Sheets: { 'Dati': ws }, SheetNames: ['Dati'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, "buvniecibas_projekti" + fileExtension);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete'))) {
      try {
        const res = await fetch(`${apiUrl}/building-cases/${id}`, { 
          method: 'DELETE',
          headers: { ...getAuthHeader() }
        });
        if (res.ok) fetchCases();
      } catch (err) { alert(t('delete_error')); }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333' }}>{t('app_title')}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={exportToExcel}
            style={{ padding: '12px 24px', backgroundColor: '#1D6F42', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {t('excel_report')}
          </button>
          <button onClick={() => navigate('/new')} style={{ padding: '12px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' }}>
            {t('new_project')}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      <div style={{ display: 'flex', padding: '0 20px', marginBottom: '10px', color: '#888', fontSize: '0.9em', fontWeight: 'bold' }}>
        <div style={{ flex: 1 }}>{t('address')}</div>
        <div style={{ width: '120px' }}>{t('width')}</div>
        <div style={{ width: '120px' }}>{t('height')}</div>
        <div style={{ width: '100px' }}>{t('blocks')}</div>
        <div style={{ width: '300px', textAlign: 'right' }}>{t('actions')}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {cases.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#2c3e50' }}>{c.objektaAdrese}</div>
              <div style={{ fontSize: '0.8em', color: '#aaa', marginTop: '4px' }}>ID: #{c.id}</div>
            </div>
            <div style={{ width: '120px', color: '#555' }}>{c.sienasPlatumsMm} mm</div>
            <div style={{ width: '120px', color: '#555' }}>{c.sienasAugstumsMm} mm</div>
            <div style={{ width: '100px' }}>
              <span style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9em' }}>
                {c.blokuSkaits}
              </span>
            </div>
            <div style={{ width: '300px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <PDFDownloadLink document={<BuildingCasePDF data={c} />} fileName={`projekts_${c.id}.pdf`}>
                {({ loading }) => (
                  <button style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? '...' : 'PDF'}
                  </button>
                )}
              </PDFDownloadLink>

              <button onClick={() => navigate(`/edit/${c.id}`)} style={{ padding: '8px 12px', backgroundColor: '#fff', color: '#2196F3', border: '1px solid #2196F3', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('edit')}</button>
              <button onClick={() => handleDelete(c.id)} style={{ padding: '8px 12px', backgroundColor: '#fff', color: '#f44336', border: '1px solid #f44336', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('delete')}</button>
            </div>
          </div>
        ))}

        {cases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#aaa', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
            {t('no_data')}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseList;