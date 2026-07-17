import { Activity, Apple, FileClock, FileUp, HeartPulse } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { to: "/", labelKey: "nav.onboarding", icon: HeartPulse },
  { to: "/upload", labelKey: "nav.upload", icon: FileUp },
  { to: "/results", labelKey: "nav.results", icon: Activity },
  { to: "/diet", labelKey: "nav.diet", icon: Apple },
  { to: "/history", labelKey: "nav.history", icon: FileClock }
];

export function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-paper text-charcoal">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-64 border-r border-line bg-paper/95 px-5 py-6 backdrop-blur md:block">
        <div className="mb-8">
          <p className="font-serif text-3xl font-bold text-pine">{t("app.name")}</p>
          <p className="mt-2 text-sm text-warmgray">{t("app.tagline")}</p>
        </div>
        <nav className="space-y-2" aria-label={t("app.name")}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-soft px-3 py-3 text-sm font-semibold transition",
                  isActive ? "bg-pine text-white" : "text-warmgray hover:bg-white hover:text-pine"
                )
              }
            >
              <item.icon className="size-5" aria-hidden="true" />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <header className="sticky top-0 z-10 border-b border-line bg-paper/85 px-4 py-3 backdrop-blur md:ml-64 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="md:hidden">
            <p className="font-serif text-2xl font-bold text-pine">{t("app.name")}</p>
          </div>
          <div className="hidden md:block" />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:ml-64 md:px-8 md:pb-10 md:pt-8">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-line bg-white px-2 py-2 shadow-soft md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 rounded-soft px-1 py-2 text-[11px] font-semibold transition",
                isActive ? "bg-pine text-white" : "text-warmgray"
              )
            }
          >
            <item.icon className="size-5" aria-hidden="true" />
            <span className="truncate">{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
