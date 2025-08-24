export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: string;
  email: string;
}

export interface JwtPayload {
  exp?: number;
  user_id?: string;
  email?: string;
}
