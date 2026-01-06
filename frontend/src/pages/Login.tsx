import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { PasswordInput } from '../components/PasswordInput';
import { useAuthStore } from '../stores/authStore';

/**
 * Login Page - Crystalline Stratum Design
 * With shake animation on repeated errors (key-based re-render)
 */
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
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
          <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
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
