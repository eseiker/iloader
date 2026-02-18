import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const languages = [
  ["en", "English"],
  ["es", "Español"],
  ["it", "Italiano"],
  ["de", "Deutsch"],
  ["fr", "Français"],
  ["vi", "Tiếng Việt"],
  ["ru", "Русский"],
  ["zh_tw", "Traditional Chinese （繁體中文)"],
  ["zh_cn", "Simpified Chinese （简体中文)"],
] as const;

export const sortedLanguages = [...languages].sort((a, b) =>
  a[0].localeCompare(b[0]),
);

type TranslationResource = Record<string, unknown>;

const localeModules = import.meta.glob<{ default: TranslationResource }>(
  "./locales/*.json",
  {
    eager: true,
  },
);

const resources = Object.fromEntries(
  Object.entries(localeModules).flatMap(([path, module]) => {
    const lang = path.match(/\/([\w-]+)\.json$/)?.[1];
    if (!lang) return [];

    return [[lang, { translation: module.default }]];
  }),
);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
  });

export default i18n;
