import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../stores/authStore';

/**
 * Login Page
 * 
 * User login form with:
 * - Username and password fields
 * - Error handling
 * - Link to register
 */
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        // Handle axios error
        const axiosError = err as { response?: { status: number } };
        if (axiosError.response?.status === 401) {
          setError('Invalid username or password');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold">Habit Pulse</h1>
          <p className="text-white/50 mt-1">Welcome back</p>
        </div>

        {/* Login form */}
        <GlassCard solid>
          <form onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center mt-6 text-white/50">
            Don't have an account?{' '}
            <Link to="/register" className="text-[rgb(var(--color-primary))] hover:underline">
              Create one
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
