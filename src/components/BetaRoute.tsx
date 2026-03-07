import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface BetaRouteProps {
  children: ReactNode;
}

/**
 * Wraps routes that require an authenticated beta tester or admin.
 * During beta, all authenticated users (who signed up with an invite code) have access.
 * Unauthenticated users are redirected to request access.
 */
const BetaRoute = ({ children }: BetaRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/request-access" replace />;
  }

  return <>{children}</>;
};

export default BetaRoute;
