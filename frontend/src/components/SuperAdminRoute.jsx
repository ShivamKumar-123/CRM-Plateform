import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Gate for /admin/* routes.
 *  - If not authenticated → redirect to /login
 *  - If authenticated but user profile hasn't hydrated yet → show splash
 *  - If authenticated but NOT a superuser → redirect to /app
 */
export default function SuperAdminRoute({ children }) {
  const { isAuthenticated, user, isSuperUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Verifying super-admin permissions…
      </div>
    );
  }

  if (!isSuperUser) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
