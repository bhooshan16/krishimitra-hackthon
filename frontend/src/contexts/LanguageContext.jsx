import React, { createContext, useContext, useState } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import kn from '../locales/kn.json';

const translations = { en, hi, kn };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => localStorage.getItem('km_lang') || 'en');

    const t = (key) => {
        const keys = key.split('.');
        let val = translations[language];
        for (const k of keys) {
            val = val?.[k];
        }
        if (val !== undefined) return val;
        // fallback to English
        let fallback = translations['en'];
        for (const k of keys) fallback = fallback?.[k];
        return fallback || key;
    };

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('km_lang', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, t, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
