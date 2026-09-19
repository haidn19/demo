import { jwtDecode } from "jwt-decode";
import type { JwtPayload, Role } from "@/types/auth";

const TOKEN_KEY = "accessToken";

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;

  // Response login từ backend phải chứa JWT dạng header.payload.signature.
  if (!token || token.split(".").length !== 3) {
    throw new Error("Login response did not contain a valid JWT");
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function normalizeRole(role: string): string {
  return role.toUpperCase().replace(/^ROLE_/, "");
}

export function getRoles(): Role[] {
  const token = getToken();
  if (!token) return [];

  try {
    const payload = jwtDecode<JwtPayload>(token);

    const rawRoles = [
      ...(Array.isArray(payload.roles)
        ? payload.roles
        : payload.roles
          ? [payload.roles]
          : []),
      ...(payload.authorities ?? []),
      ...(payload.scope ? payload.scope.split(" ") : []),
    ];

    return rawRoles
      .map(normalizeRole)
      .map((role) => (role === "USER" ? "STAFF" : role))
      .filter((role): role is Role => role === "STAFF" || role === "ADMIN");
  } catch {
    return [];
  }
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function hasRole(role: Role): boolean {
  return getRoles().includes(role);
}

export function isAdmin(): boolean {
  return hasRole("ADMIN");
}
