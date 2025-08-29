import { createContext } from "react";
import type { AuthTokens, User } from "../types";

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (userData: User, tokens: AuthTokens) => void;
  logout: () => void;
  authTokens: AuthTokens | null;
  user: User | null;
  setUser: (user: User | null) => void;
  setAuthTokens: (tokens: AuthTokens | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  authTokens: null,
  user: null,
  setUser: () => {},
  setAuthTokens: () => {},});
