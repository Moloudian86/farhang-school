import { PageMeta } from "../types";

export interface ApiReply<T> { data: T; meta: PageMeta | null }

/** Every page reads data through this one function. */
export async function api<T>(path: string): Promise<ApiReply<T>> {
  const res = await fetch(`/api/v1${path}`, { credentials: "include" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.message ?? "ارتباط با سرور برقرار نشد");
  return { data: json.data as T, meta: json.meta as PageMeta | null };
}

/** Error thrown by POST requests. `fields` holds per-field messages sent by the backend validation. */
export class FormError extends Error {
  constructor(message: string, public fields: Record<string, string> = {}) {
    super(message);
  }
}

/** Sends JSON to the backend (used by the enrollment and contact forms). */
export async function apiPost<T>(path: string, body: unknown): Promise<{ data: T; message: string | null }> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new FormError("ارتباط با سرور برقرار نشد. اتصال اینترنت یا روشن بودن Backend را بررسی کنید");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    const fields: Record<string, string> = {};
    (json?.errors as { field: string; message: string }[] | undefined)?.forEach((e) => {
      if (e.field && !fields[e.field]) fields[e.field] = e.message;
    });
    throw new FormError(json?.message ?? "ارسال اطلاعات انجام نشد", fields);
  }
  return { data: json.data as T, message: json.message ?? null };
}
