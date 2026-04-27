"use client";

import { useLanguage } from "@/lib/i18n/context";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  function toggle() {
    setLanguage(language === "en" ? "hi" : "en");
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${language === "en" ? "Hindi" : "English"}`}
      className="text-sm font-semibold text-muted-foreground border border-border rounded-full px-3 py-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-muted hover:text-foreground transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {language === "en" ? "EN" : "HI"}
    </button>
  );
}
