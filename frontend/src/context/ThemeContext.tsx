import { createContext } from "react";
import type { ThemeContextType } from "../types";

export const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  toggleMode: () => {},
  setMode: () => {},
});
