import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, apiSend, AUTH_EXPIRED_EVENT } from "../lib/api";
import { AuthUser } from "../panelTypes";

interface AuthState {
  user: AuthUser | null;
  /** true only while we are asking the server "who is logged in?" the first time */
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Where each role lands after login. */
export const HOME_BY_ROLE = {
  ADMIN: "/panel/admin", TEACHER: "/panel/teacher", STUDENT: "/panel/student", PARENT: "/panel/parent",
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On page load: the login cookie (if any) tells the server who we are.
  useEffect(() => {
    api<{ user: AuthUser }>("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // If the session expires while using the panel, any API call fires this event.
  useEffect(() => {
    const onExpired = () => { setUser(null); queryClient.clear(); };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiSend<{ user: AuthUser }>("POST", "/auth/login", { email, password });
    queryClient.clear(); // never show the previous person's cached data
    setUser(data.user);
    return data.user;
  }, [queryClient]);

  const logout = useCallback(async () => {
    await apiSend("POST", "/auth/logout").catch(() => undefined);
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
