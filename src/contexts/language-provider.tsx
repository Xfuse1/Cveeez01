"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

type LanguageProviderProps = {
  children: React.ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
};

type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
};

const LanguageProviderContext =
  createContext<LanguageProviderState>(initialState);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  storageKey = "cveeez-lang",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    try {
      const storedLanguage = localStorage.getItem(storageKey) as Language | null;
      if (storedLanguage) {
        setLanguage(storedLanguage);
      }
    } catch (e) {
      // Local storage is not available
    }
  }, [storageKey]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(storageKey, language);
    } catch (e) {
      // Local storage is not available
    }
  }, [language, storageKey]);

  const value = {
    language,
    setLanguage: (language: Language) => {
      setLanguage(language);
    },
  };

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};
