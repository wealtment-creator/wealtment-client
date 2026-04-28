import type { User } from "@/types";
import { saveToken, clearToken } from "@/lib/endpointRoute";

const USER_KEY = "ef_user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const u: User = JSON.parse(raw);
    if (!u.token) return null;
    u.btcBalance  = u.btcBalance  ?? 0;
    u.name       = u.name       ?? "Unknown";
    u.ltcBalance  = u.ltcBalance  ?? 0;
    u.balance     = u.balance     ?? 0;
    u.isAdmin     = u.isAdmin     ?? u.role === "admin";
    u.bitcoin     = u.bitcoin     ?? u.bitcoinAddress;
    u.litecoin    = u.litecoin    ?? u.litecoinAddress;
    return u;
  } catch { return null; }
}

export function setUser(user: User): void {
  saveToken(user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
  clearToken();
  localStorage.removeItem(USER_KEY);
}
