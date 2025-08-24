import { createContext } from "react";
import type { AuthTokens, User } from "../types";

interface AuthContextType {
  authTokens: AuthTokens | null;
  user: User | null;
  setUser: (user: User | null) => void;
  setAuthTokens: (tokens: AuthTokens | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  authTokens: null,
  user: null,
  setUser: () => {},
  setAuthTokens: () => {},
});
