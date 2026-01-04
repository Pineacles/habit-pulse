import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { useAuthStore } from '../stores/authStore';

/**
 * Register Page
 * 
 * User registration form with:
 * - Username and password fields
 * - Password confirmation
 * - Validation
 * - Error handling
 */
export function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register({ username, password });
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        if (axiosError.response?.data?.error) {
          setError(axiosError.response.data.error);
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
          <p className="text-white/50 mt-1">Create your account</p>
        </div>

        {/* Register form */}
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
                placeholder="Choose a username"
                required
                autoComplete="username"
                autoFocus
              />
              <p className="text-xs text-white/40 mt-1">At least 3 characters</p>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm text-white/60 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-white/40 mt-1">At least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center mt-6 text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-[rgb(var(--color-primary))] hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
