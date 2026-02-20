import { useContext, useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthTokens, User } from "../types";
import { Navigate, Outlet } from "react-router-dom";

interface AuthProviderProps {
  children: ReactNode;
}

export const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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
    } else {
      setIsAuthenticated(false); // Add this line
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
  };

  return (
    <AuthContext.Provider
      value={{
        authTokens,
        user,
        setUser,
        setAuthTokens,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
