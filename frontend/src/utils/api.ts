import { readDevSession } from "@/auth/dev-session";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const session = readDevSession();
  if (session?.token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response, path), response.status);
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response, path: string) {
  try {
    const body = (await response.json()) as { detail?: string; message?: string; title?: string };
    return body.detail ?? body.message ?? body.title ?? `Request to ${path} failed (${response.status})`;
  } catch {
    return `Request to ${path} failed (${response.status})`;
  }
}

/** Returns seed data until VITE_USE_API=true points the app at Spring Boot. */
export async function loadOrFallback<T>(path: string, fallback: T): Promise<T> {
  if (import.meta.env.VITE_USE_API !== "true") return fallback;
  return api<T>(path);
}
