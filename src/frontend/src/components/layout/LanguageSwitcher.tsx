import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../hooks/useLanguage";
import type { LanguageCode } from "../../lib/types";

const languages: LanguageCode[] = ["en", "hi", "te"];

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <label className="inline-flex items-center gap-2 rounded-soft border border-line bg-white px-3 py-2 text-sm text-warmgray">
      <Languages className="size-4 text-pine" aria-hidden="true" />
      <span className="sr-only">{t("language.label")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as LanguageCode)}
        className="bg-transparent font-semibold text-charcoal outline-none"
      >
        {languages.map((code) => (
          <option value={code} key={code}>
            {t(`language.${code}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
