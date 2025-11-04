
// Placeholder for theme-related utilities
// For example, functions to get and set the theme

export function getTheme() {
    if (typeof window !== "undefined") {
        return localStorage.getItem('theme') || 'light';
    }
    return 'light';
}
