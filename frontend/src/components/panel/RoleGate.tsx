import { Navigate, Outlet, useLocation } from "react-router-dom";
import { HOME_BY_ROLE, useAuth } from "../../auth/AuthContext";
import { Role } from "../../panelTypes";
import { Skeleton } from "../ui/States";

/** Wraps all /panel pages: not logged in -> login page (and come back here afterwards). */
export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="mx-auto max-w-5xl p-8"><Skeleton className="h-64" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Wraps one role's pages: a teacher typing /panel/admin in the address bar is sent to his own panel. */
export function RoleGate({ role }: { role: Role }) {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== role) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  return <Outlet />;
}

/** /panel itself: send everybody to their own panel. */
export function PanelRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? HOME_BY_ROLE[user.role] : "/login"} replace />;
}
