import React, { useContext, useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthTokens, User } from "../types";
import { Navigate, Outlet } from "react-router-dom";


interface AuthProviderProps {
  children: ReactNode;
}

export const ProtectedRoute = () => {
  const isAuthenticated = useContext(AuthContext);
  
  return isAuthenticated ? <Outlet/> : <Navigate to="/login" replace />
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedAuthTokens = localStorage.getItem("authTokens");
    const storedUser = localStorage.getItem("user");
    if (storedAuthTokens && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        const tokens = JSON.parse(storedAuthTokens) as AuthTokens;
        setAuthTokens(tokens);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored data:", error);
        logout();
      }
    }
  }, []);

  const login = (userData: User, tokens: AuthTokens) => {
    setAuthTokens(tokens);
    setUser(userData);
    localStorage.setItem("authTokens", JSON.stringify(tokens));
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
  };

  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ authTokens, user, setUser, setAuthTokens, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
