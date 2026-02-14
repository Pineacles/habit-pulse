import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { useThemeStore } from '../stores/themeStore';

/**
 * ForgotPassword - Password reset request form.
 */
export function ForgotPassword() {
  const { mode, setMode } = useThemeStore();
  const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
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
          <p className="system-status">Reset your password</p>
        </div>

        {isSubmitted ? (
          /* Success State */
          <div style={{ textAlign: 'center' }}>
            <div 
              style={{ 
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <svg 
                style={{ width: '28px', height: '28px', color: '#34D399' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: 'white',
              marginBottom: '6px'
            }}>
              Check your inbox
            </h2>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              If an account exists for{' '}
              <span style={{ color: 'white', fontWeight: 500 }}>{username}</span>, 
              you'll receive reset instructions shortly.
            </p>
            
            <Link 
              to="/login" 
              className="btn btn-primary"
              style={{ display: 'block', textDecoration: 'none' }}
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} noValidate>
            <p className="footer-text" style={{ textAlign: 'center', marginBottom: '20px' }}>
              Enter your username and we'll send you instructions to reset your password.
            </p>

            <div className="input-group" style={{ marginBottom: '20px' }}>
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

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            {/* Footer */}
            <div className="footer-links">
              <span className="footer-text">
                Remember your password?
              </span>
              {' '}
              <Link to="/login" className="text-link">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
