import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Gate for /manage/* routes — the org-admin console.
 *
 * Access rules:
 *  - Not authenticated → /login
 *  - User profile not yet hydrated → splash
 *  - Super-admin (platform owner) → allowed (so they can preview org-admin view)
 *  - role === "OWNER" or "ADMIN" → allowed
 *  - Anything else (SALES / MANAGER / SUPPORT / DEALER / etc.) → /app
 */
const ORG_ADMIN_ROLES = new Set(["OWNER", "ADMIN"]);

export default function OrgAdminRoute({ children }) {
  const { isAuthenticated, user, isSuperUser, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Verifying organization-admin permissions…
      </div>
    );
  }

  const allowed = isSuperUser || ORG_ADMIN_ROLES.has(role);
  if (!allowed) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
