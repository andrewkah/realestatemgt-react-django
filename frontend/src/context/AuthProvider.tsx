import React, { useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthTokens, User } from "../types";


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ authTokens, user, setUser, setAuthTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
