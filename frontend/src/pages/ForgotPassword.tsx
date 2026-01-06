import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/FormField';

/**
 * ForgotPassword Page - Crystalline Stratum Design
 */
export function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
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
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
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
              <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
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
