export type Role = "STAFF" | "USER" | "ADMIN";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface JwtPayload {
  sub: string;
  exp?: number;
  roles?: string[] | string;
  authorities?: string[];
  scope?: string;
}
