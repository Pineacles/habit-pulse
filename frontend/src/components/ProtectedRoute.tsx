import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { AnimatedBackground } from './AnimatedBackground';

/**
 * ProtectedRoute
 * 
 * Wraps routes that require authentication.
 * Redirects to login if not authenticated.
 * Shows loading state while checking auth.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show branded loading screen while checking auth
  if (isLoading) {
    return (
      <div className="loading-screen">
        <AnimatedBackground />
        <div className="loading-content">
          {/* Brand */}
          <h1 className="loading-brand">
            Habit Pulse<span className="loading-dot">.</span>
          </h1>
          
          {/* Spinner */}
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
          </div>
          
          {/* Status text */}
          <p className="loading-text">Loading your goals...</p>
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
