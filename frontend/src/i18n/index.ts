import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import cs from "./locales/cs.json";

const STORAGE_KEY = "locale";
const DEFAULT_LOCALE = "en";
const VALID_LOCALES = ["en", "fr", "cs"] as const;

const stored = localStorage.getItem(STORAGE_KEY);
const savedLocale = VALID_LOCALES.includes(
  stored as (typeof VALID_LOCALES)[number],
)
  ? (stored as string)
  : DEFAULT_LOCALE;

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en",
  messages: { en, fr, cs },
});
