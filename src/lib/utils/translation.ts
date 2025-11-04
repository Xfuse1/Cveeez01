
// Placeholder for translation utilities
// For example, a function to get the current language

export function getCurrentLanguage() {
    if (typeof window !== "undefined") {
        return document.documentElement.lang || 'en';
    }
    return 'en';
}
