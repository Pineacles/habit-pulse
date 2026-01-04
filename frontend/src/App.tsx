import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { AnimatedBackground } from './components/AnimatedBackground';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AllGoals } from './pages/AllGoals';
import { Settings } from './pages/Settings';

/**
 * App
 * 
 * Root component that sets up:
 * - Authentication check on mount
 * - React Router routes
 * - Protected and public routes
 */
function App() {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      {/* Background for auth pages */}
      {!isAuthenticated && <AnimatedBackground />}

      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            !isLoading && isAuthenticated 
              ? <Navigate to="/" replace /> 
              : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            !isLoading && isAuthenticated 
              ? <Navigate to="/" replace /> 
              : <Register />
          } 
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/goals" element={<AllGoals />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
