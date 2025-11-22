import { useContext, useEffect, useState } from "react";
import type { ThemeMode } from "../types";
import { ThemeContext } from "./ThemeContext";
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setStateMode] = useState<ThemeMode>(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme as ThemeMode;
    }
    // return window.matchMedia &&
    //   window.matchMedia("(prefers-color-scheme: light)").matches
    //   ? "light"
    //   : "dark";
    
    // Always default to light
    return "light";
  });

  // Apply the theme class to the document's root element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(mode);
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleMode = () => {
    setStateMode((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const setMode = (mode: ThemeMode) => {
    setStateMode(mode);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}