import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'lv' ? 'en' : 'lv';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button 
      onClick={toggleLanguage}
      style={{
        padding: '8px 16px',
        backgroundColor: '#eee',
        border: '1px solid #ccc',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginLeft: '10px'
      }}
    >
      {i18n.language === 'lv' ? 'ENG' : 'LV'}
    </button>
  );
};

export default LanguageSwitcher;