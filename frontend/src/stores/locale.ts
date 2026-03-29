import { defineStore } from "pinia";
import { i18n } from "@/i18n";

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "cs", label: "Čeština" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

export const useLocaleStore = defineStore("locale", () => {
  const current = i18n.global.locale;

  function setLocale(code: LocaleCode) {
    current.value = code;
    localStorage.setItem("locale", code);
  }

  return { current, setLocale, SUPPORTED_LOCALES };
});
