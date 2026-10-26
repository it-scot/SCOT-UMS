import type { ModulePath } from "@/components/layout/nav";

export const DEV_SESSION_KEY = "scot-erp-dev-session";
export const DEV_SESSION_EVENT = "scot-erp-session";

export type DevRoleKey = "IT_ADMIN" | "SYSTEM_ADMIN" | "HR" | "EMPLOYEE";

export type DevUser = {
  email: string;
  name: string;
  role: string;
  roleKey: DevRoleKey;
  initials: string;
  home: ModulePath;
};

export type DevLoginPreset = DevUser & {
  id: string;
  label: string;
  caption: string;
  emoji: string;
  accentClass: string;
};

export type DevSession = {
  token: string;
  user: DevUser;
};

export const DEV_LOGINS: DevLoginPreset[] = [
  {
    id: "it",
    label: "IT Admin",
    caption: "IT Helpdesk workspace",
    emoji: "🟢",
    email: "it@scot.lk",
    name: "Ishan Perera",
    role: "IT Admin",
    roleKey: "IT_ADMIN",
    initials: "IP",
    home: "/helpdesk",
    accentClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "admin",
    label: "System Admin",
    caption: "Admin & logistics workspace",
    emoji: "🔵",
    email: "admin@scot.lk",
    name: "Krishan Malinda",
    role: "System Admin",
    roleKey: "SYSTEM_ADMIN",
    initials: "KM",
    home: "/admin",
    accentClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "hr",
    label: "HR Officer",
    caption: "People and leave workspace",
    emoji: "🟠",
    email: "hr@scot.lk",
    name: "Nadeesha Perera",
    role: "HR Officer",
    roleKey: "HR",
    initials: "NP",
    home: "/hr",
    accentClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "employee",
    label: "Standard Employee",
    caption: "Shift and attendance workspace",
    emoji: "⚪",
    email: "emp@scot.lk",
    name: "Ruwan Jayasinghe",
    role: "Employee",
    roleKey: "EMPLOYEE",
    initials: "RJ",
    home: "/",
    accentClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
];

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function issueDevJwt(user: DevUser): string {
  const header = toBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(
    JSON.stringify({
      sub: user.email,
      email: user.email,
      name: user.name,
      role: user.roleKey,
      iss: "scot-erp-dev",
      iat: now,
      exp: now + 60 * 60 * 24,
    }),
  );
  return `${header}.${payload}.dev-signature`;
}

export function readDevSession(): DevSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEV_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevSession;
    if (!parsed?.token || !parsed.user?.email || !parsed.user.home) return null;
    return parsed;
  } catch {
    return null;
  }
}

function notifySessionChanged() {
  window.dispatchEvent(new Event(DEV_SESSION_EVENT));
}

export function startDevSession(preset: DevLoginPreset): DevSession {
  const user: DevUser = {
    email: preset.email,
    name: preset.name,
    role: preset.role,
    roleKey: preset.roleKey,
    initials: preset.initials,
    home: preset.home,
  };
  const session: DevSession = { token: issueDevJwt(user), user };
  window.localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(session));
  notifySessionChanged();
  return session;
}

export function clearDevSession() {
  window.localStorage.removeItem(DEV_SESSION_KEY);
  notifySessionChanged();
}

export function canAccessPath(roleKey: DevRoleKey, path: string): boolean {
  if (roleKey === "SYSTEM_ADMIN") return true;
  const preset = DEV_LOGINS.find((item) => item.roleKey === roleKey);
  return preset?.home === path;
}

export function modulesForRole(roleKey: DevRoleKey): ModulePath[] {
  if (roleKey === "SYSTEM_ADMIN") return ["/", "/hr", "/admin", "/helpdesk"];
  const preset = DEV_LOGINS.find((item) => item.roleKey === roleKey);
  return preset ? [preset.home] : ["/"];
}
