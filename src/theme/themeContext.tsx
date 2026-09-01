import { createContext } from "react";
import type { ThemeName } from "./theme";

export interface ThemeContextType {
  theme: ThemeName;
  applyTheme: (theme: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
