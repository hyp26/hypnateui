import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en/translation.json';
import hiTranslations from '../locales/hi/translation.json';
import bnTranslations from '../locales/bn/translation.json';
import orTranslations from '../locales/or/translation.json';
import urTranslations from '../locales/ur/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      bn: { translation: bnTranslations },
      or: { translation: orTranslations },
      ur: { translation: urTranslations }

    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
