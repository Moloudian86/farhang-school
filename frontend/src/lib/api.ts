import { PageMeta } from "../types";

export interface ApiReply<T> { data: T; meta: PageMeta | null }

/** Sent when the server says "you are not logged in" in the middle of using the panel. */
export const AUTH_EXPIRED_EVENT = "farhang:auth-expired";

function notifyIfExpired(status: number, path: string) {
  if (status === 401 && !path.startsWith("/auth/")) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

/** Every page reads data through this one function. */
export async function api<T>(path: string): Promise<ApiReply<T>> {
  const res = await fetch(`/api/v1${path}`, { credentials: "include" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    notifyIfExpired(res.status, path);
    throw new Error(json?.message ?? "ارتباط با سرور برقرار نشد");
  }
  return { data: json.data as T, meta: json.meta as PageMeta | null };
}

/** Error thrown by write requests. `fields` holds per-field messages sent by the backend validation. */
export class FormError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) {
    super(message);
  }
}

type Method = "POST" | "PUT" | "PATCH" | "DELETE";

/** Sends JSON to the backend (forms, login, panel actions). */
export async function apiSend<T>(method: Method, path: string, body?: unknown): Promise<{ data: T; message: string | null }> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new FormError("ارتباط با سرور برقرار نشد. اتصال اینترنت یا روشن بودن Backend را بررسی کنید");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    notifyIfExpired(res.status, path);
    const fields: Record<string, string> = {};
    (json?.errors as { field: string; message: string }[] | undefined)?.forEach((e) => {
      if (e.field && !fields[e.field]) fields[e.field] = e.message;
    });
    throw new FormError(json?.message ?? "ارسال اطلاعات انجام نشد", fields);
  }
  return { data: json.data as T, message: json.message ?? null };
}

export const apiPost = <T>(path: string, body: unknown) => apiSend<T>("POST", path, body);
