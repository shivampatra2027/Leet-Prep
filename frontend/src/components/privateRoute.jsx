import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export default function PrivateRoute({ children }) {
  const loading = useAuthStore((s) => s.loading);
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => Boolean(s.user));

  if (loading || !initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
