import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import cs from "./locales/cs.json";

const STORAGE_KEY = "locale";
const DEFAULT_LOCALE = "en";

const savedLocale = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCALE;

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en",
  messages: { en, fr, cs },
});
