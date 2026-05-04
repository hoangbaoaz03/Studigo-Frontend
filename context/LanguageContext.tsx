"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { LocaleData } from "@/locales/types";
import { en } from "@/locales/en";
import { vi } from "@/locales/vi";

type Locale = "en" | "vi";

interface LanguageContextType {
  locale: Locale;
  t: LocaleData;
  setLocale: (locale: Locale) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi"); // Default to Vietnamese
  
  // Load preference from local storage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("app_locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "vi")) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("app_locale", newLocale);
  };

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "vi" : "en");
  };

  const t = locale === "en" ? en : vi;

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
