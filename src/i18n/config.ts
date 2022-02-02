import i18n from 'i18next';
import translation_en from './en/translation.json';
import translation_sl from './sl/translation.json';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from "i18next-browser-languagedetector";

export const resources = {
  en: {
    translation: translation_en,
  },
  sl: {
    translation: translation_sl,
  },
} as const;

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
  resources,
});
// i18n.changeLanguage("sl");