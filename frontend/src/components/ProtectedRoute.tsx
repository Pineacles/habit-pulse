import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * ProtectedRoute
 * 
 * Wraps routes that require authentication.
 * Redirects to login if not authenticated.
 * Shows loading state while checking auth.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render child routes
  return <Outlet />;
}
