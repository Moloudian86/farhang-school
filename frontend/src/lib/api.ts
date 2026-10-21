import { PageMeta } from "../types";

export interface ApiReply<T> { data: T; meta: PageMeta | null }

/** Every page reads data through this one function. */
export async function api<T>(path: string): Promise<ApiReply<T>> {
  const res = await fetch(`/api/v1${path}`, { credentials: "include" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.message ?? "ارتباط با سرور برقرار نشد");
  return { data: json.data as T, meta: json.meta as PageMeta | null };
}
