import type { JSX } from "react";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: number;
}

export interface JwtPayload {
  exp?: number;
  is_active?: number;
  user_id?: string;
  username?: string;
  email?: string;
}

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}
export interface SponsorProps {
  icon: JSX.Element;
  name: string;
}
export interface statsProps {
  quantity: string;
  description: string;
}
export interface WorkListProps {
  icon: JSX.Element;
  title: string;
  description: string;
}
export interface FeatureProps {
  title: string;
  description: string;
  image: string;
}
export interface TestimonialProps {
  image: string;
name: string;
userName: string;
comment: string;
}