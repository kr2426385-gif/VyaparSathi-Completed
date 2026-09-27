import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem('vyapar_lang') 
      || localStorage.getItem('i18nextLng') 
      || localStorage.getItem('vyapar_language');
    if (saved && ['mr', 'hi', 'en'].includes(saved)) {
      localStorage.setItem('vyapar_lang', saved);
      return saved;
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  return 'mr'; // Default to Marathi for Maharashtra rural entrepreneurship
};

const initialLang = getInitialLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr }
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('vyapar_lang', lng);
    localStorage.setItem('i18nextLng', lng);
    localStorage.setItem('vyapar_language', lng);
  } catch (e) {
    // Ignore localStorage errors
  }
});

export default i18n;

