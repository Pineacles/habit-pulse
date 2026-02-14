import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { PasswordInput } from '../components/PasswordInput';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

/**
 * Login - Authentication form with shake animation on repeated errors.
 */
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(0);
  const hadErrorRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ username: username.trim().toLowerCase(), password });
      navigate('/', { replace: true });
    } catch (err) {
      if (hadErrorRef.current) {
        setErrorKey(prev => prev + 1);
      }
      hadErrorRef.current = true;

      if (err instanceof Error) {
        const axiosError = err as { response?: { status: number } };
        if (axiosError.response?.status === 401) {
          setError('Invalid username or password. Please try again.');
        } else {
          setError('Unable to connect. Please check your network.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="animated-bg" />

      {/* Dark/Light Mode Toggle */}
      <button
        type="button"
        className="auth-mode-toggle"
        onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'light' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m7-9h2M3 12H5m11.657-6.657 1.414 1.414M5.929 18.071l1.414-1.414m0-9.9L5.93 5.343m12.728 12.728-1.414-1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>

      {/* Glass Panel */}
      <div className="glass-solid glass-form">
        
        {/* Brand Header */}
        <div className="brand-header">
          <h1 className="logo-text">
            Habit Pulse<span className="accent-dot">.</span>
          </h1>
          <p className="system-status">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          
          {/* Error Alert with shake animation */}
          {error && (
            <div 
              key={errorKey}
              className="alert alert-error alert-shake"
              role="alert"
              aria-live="assertive"
              style={{ marginBottom: '16px' }}
            >
              <svg 
                className="alert-icon w-4 h-4 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="input-group">
            <FormField label="Username" htmlFor="username">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                autoFocus
                aria-required="true"
              />
            </FormField>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <FormField label="Password" htmlFor="password">
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </FormField>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-link-container">
            <Link to="/forgot-password" className="text-link">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="footer-links">
          <span className="footer-text">
            Don't have an account?
          </span>
          {' '}
          <Link to="/register" className="text-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
