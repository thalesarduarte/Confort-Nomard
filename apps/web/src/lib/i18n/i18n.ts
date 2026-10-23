import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from './locales/pt-BR/translation.json';
import enUS from './locales/en-US/translation.json';
import esES from './locales/es-ES/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'pt-BR',
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES }
    },
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
