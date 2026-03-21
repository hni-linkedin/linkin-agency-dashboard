import { decodeJwt } from "jose";

const ACCESS_KEY = "la_access_token";
const PROFILE_NAME_KEY = "la_profile_name";
const AUTH_USER_KEY = "la_auth_user";
const SIGNED_OUT_KEY = "la_signed_out";

type DecodedToken = {
  userId: string;
  email?: string;
  name?: string;
  role: "admin" | "manager" | "client";
  parentId: string | null;
  clientId: string | null;
  exp: number;
};

export type StoredAuthUser = {
  id: string;
  email: string;
  role: "admin" | "manager" | "client";
  name: string;
  forcePasswordChange: boolean;
};

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, token);
  localStorage.removeItem(SIGNED_OUT_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
}

export function saveAccessCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `la_access_token=${token}; path=/; SameSite=Strict`;
  if (typeof window !== "undefined") {
    localStorage.removeItem(SIGNED_OUT_KEY);
  }
}

export function clearAccessCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "la_access_token=; Max-Age=0; path=/; SameSite=Strict";
}

export function saveProfileName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_NAME_KEY, name);
}

export function getProfileName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PROFILE_NAME_KEY);
}

export function removeProfileName() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_NAME_KEY);
}

export function saveAuthUser(user: StoredAuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function removeAuthUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_USER_KEY);
}

export function markSignedOut() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIGNED_OUT_KEY, "true");
}

export function clearSignedOutMark() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SIGNED_OUT_KEY);
}

export function isSignedOutMarked(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIGNED_OUT_KEY) === "true";
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    return decodeJwt(token) as DecodedToken;
  } catch {
    return null;
  }
}
