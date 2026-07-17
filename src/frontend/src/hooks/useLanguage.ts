import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { LanguageCode } from "../lib/types";

export function useLanguage() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "en") as LanguageCode;

  const setLanguage = useCallback(
    (nextLanguage: LanguageCode) => {
      window.localStorage.setItem("swasth-language", nextLanguage);
      void i18n.changeLanguage(nextLanguage);
    },
    [i18n]
  );

  return { language, setLanguage };
}
