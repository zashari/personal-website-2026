import { useEffect, useRef, useState } from 'react';

// Colour mode shared by /home and /about. Light is the default. The choice is kept per browser; each page's
// index.html applies it before first paint, so this only reads what is already on <html> and writes changes back.
const THEME_KEY = 'zashari-home-theme';
const THEME_COLOR = { light: '#dbd5c9', dark: '#202020' };

const THEME_FADE_MS = 600; // matches --theme-time in home.css and about.css

export function useTheme() {
  const [theme, setThemeState] = useState(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  const fadeTimer = useRef(null);
  const setTheme = (next) => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => root.classList.remove('theme-switching'), THEME_FADE_MS);
    setThemeState(next);
  };
  useEffect(() => () => clearTimeout(fadeTimer.current), []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage can be blocked (private mode, site data off); the mode then lasts for this visit only.
    }
  }, [theme]);
  return [theme, setTheme];
}
