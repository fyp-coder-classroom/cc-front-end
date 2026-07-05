import { useState, useEffect } from "react";
import type { PropsWithChildren } from "react";
import { themes } from "./theme";
import type { ThemeName } from "./theme";
import { ThemeContext } from "./themeContext";

function applyThemeVars(name: ThemeName) {
  const current = themes[name];
  Object.entries(current).forEach(([key, value]) => {
    const cssVar = "--" + key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    document.documentElement.style.setProperty(cssVar, value);
  });
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    return (localStorage.getItem("cc-theme") as ThemeName) ?? "dark";
  });

  // Apply on mount + whenever theme changes
  useEffect(() => {
    applyThemeVars(theme);
    localStorage.setItem("cc-theme", theme);
  }, [theme]);

  const applyTheme = (name: ThemeName) => setTheme(name);

  return (
    <ThemeContext.Provider value={{ theme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
