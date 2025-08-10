import { useEffect, useState } from 'react';

const THEME_KEY = 'app-theme';
const themeClasses = ['theme-light', 'theme-dark', 'theme-sepia'];

export default function useTheme() {
    const [theme, setThemeState] = useState<string>('theme-light');

    const applyTheme = (newTheme: string) => {
        const body = document.body;

        // Remove all other theme classes
        themeClasses.forEach(cls => body.classList.remove(cls));

        // Add the selected theme class
        body.classList.add(newTheme);
    };

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
        applyTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'theme-light';
        setTheme(savedTheme);
    }, []);

    return { theme, setTheme };
}
