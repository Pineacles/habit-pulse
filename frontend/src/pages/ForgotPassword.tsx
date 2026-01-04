import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/FormField';

/**
 * ForgotPassword Page - Crystalline Stratum Design
 * Goldilocks spacing: not too tight, not too loose
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
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        
        {/* Glass Panel - Goldilocks padding */}
        <div className="glass-solid" style={{ padding: '32px 40px 40px 40px' }}>
          
          {/* Brand Header */}
          <div className="brand-header">
            <h1 className="logo-text">
              Habit Pulse<span className="accent-dot">.</span>
            </h1>
            <p className="system-status">Reset your password</p>
          </div>

          {isSubmitted ? (
            /* Success State */
            <div className="text-center">
              <div 
                className="w-14 h-14 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mx-auto"
                style={{ marginBottom: '16px' }}
              >
                <svg 
                  className="w-7 h-7 text-emerald-400" 
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
              
              <h2 className="text-lg font-semibold text-white" style={{ marginBottom: '6px' }}>
                Check your inbox
              </h2>
              <p className="text-white/50 text-sm" style={{ marginBottom: '20px' }}>
                If an account exists for <span className="text-white font-medium">{username}</span>, 
                you'll receive reset instructions shortly.
              </p>
              
              <Link to="/login" className="btn btn-primary block">
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-white/50 text-sm text-center" style={{ marginBottom: '20px' }}>
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
                <span className="text-white/50 text-sm">Remember your password?</span>
                {' '}
                <Link to="/login" className="text-link">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
