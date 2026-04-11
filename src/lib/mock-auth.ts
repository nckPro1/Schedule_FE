import { GV_ACCOUNTS } from "./mock-data";
import type { GvAccount } from "./types";

const GV_SESSION_KEY = "gv_session";
const ADMIN_SESSION_KEY = "admin_session";

// ─── Giáo viên ────────────────────────────────────────────────────────────────

export function loginGv(username: string, password: string): GvAccount | null {
  const account = GV_ACCOUNTS.find(
    (a) => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password
  );
  return account ?? null;
}

export function setGvSession(account: GvAccount): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GV_SESSION_KEY, JSON.stringify(account));
}

export function getGvSession(): GvAccount | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(GV_SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as GvAccount; } catch { return null; }
}

export function clearGvSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GV_SESSION_KEY);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function loginAdmin(username: string, password: string): boolean {
  return username.trim().toLowerCase() === "admin" && password === "123";
}

export function setAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
}

export function getAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
