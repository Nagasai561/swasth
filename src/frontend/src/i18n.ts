import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en/common.json";
import hi from "./locales/hi/common.json";
import te from "./locales/te/common.json";

const storedLanguage = window.localStorage.getItem("swasth-language");

i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
    hi: { common: hi },
    te: { common: te }
  },
  lng: storedLanguage || "en",
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
