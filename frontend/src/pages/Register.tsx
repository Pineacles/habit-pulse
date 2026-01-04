import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordStrengthChecker, PasswordSatellitePanel } from '../components/PasswordStrengthChecker';
import { useAuthStore } from '../stores/authStore';

/**
 * Register Page - Crystalline Stratum Design
 * With satellite panel for password requirements
 */
export function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Username validation regex: only alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  // Email validation regex
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    // Username validation
    if (username.length < 3) {
      errors.username = 'Must be at least 3 characters';
    } else if (username.length > 30) {
      errors.username = 'Cannot exceed 30 characters';
    } else if (!usernameRegex.test(username)) {
      errors.username = 'Only letters, numbers, and underscores allowed';
    }

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    // Password validation (NIST 2024 guidelines)
    if (password.length < 8) {
      errors.password = 'Must be at least 8 characters';
    }

    // Confirm password
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords don\'t match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Send lowercase username and email
      await register({ 
        username: username.trim().toLowerCase(), 
        email: email.trim().toLowerCase(),
        password 
      });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        const axiosError = err as { response?: { data?: { error?: string }, status?: number } };
        const errorMessage = axiosError.response?.data?.error || '';
        
        // Handle specific backend errors
        if (errorMessage.includes('Username already taken')) {
          setFieldErrors({ username: 'This username is already taken' });
        } else if (errorMessage.includes('Email already registered')) {
          setFieldErrors({ email: 'This email is already registered' });
        } else if (axiosError.response?.status === 409) {
          setFieldErrors({ username: 'This username is already taken' });
        } else if (errorMessage) {
          setError(errorMessage);
        } else {
          setError('Unable to connect. Please try again.');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      {/* Auth Layout - Card centered, Satellite absolute positioned */}
      <div className="auth-layout">
        
        {/* Main Glass Panel - Perfectly Centered */}
        <div className="auth-card-wrapper">
          <div className="glass-solid" style={{ padding: '32px 40px 40px 40px' }}>
            
            {/* Brand Header */}
            <div className="brand-header">
              <h1 className="logo-text">
                Habit Pulse<span className="accent-dot">.</span>
              </h1>
              <p className="system-status">Create your account</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              
              {/* Error Alert */}
              {error && (
                <div 
                  className="alert alert-error"
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
                <FormField 
                  label="Username" 
                  htmlFor="username"
                  error={fieldErrors.username}
                >
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    autoComplete="username"
                    autoFocus
                    aria-required="true"
                    aria-invalid={!!fieldErrors.username}
                    className={fieldErrors.username ? 'input-error' : ''}
                  />
                </FormField>
              </div>

              {/* Email Field */}
              <div className="input-group">
                <FormField 
                  label="Email" 
                  htmlFor="email"
                  error={fieldErrors.email}
                >
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={!!fieldErrors.email}
                    className={fieldErrors.email ? 'input-error' : ''}
                  />
                </FormField>
              </div>

              {/* Password Field */}
              <div className="input-group">
                <FormField 
                  label="Password" 
                  htmlFor="password"
                  error={fieldErrors.password}
                >
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    hasError={!!fieldErrors.password}
                  />
                </FormField>
                
                {/* Mobile: Inline strength indicator */}
                <PasswordStrengthChecker password={password} />
              </div>

              {/* Confirm Password Field */}
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <FormField 
                  label="Confirm Password" 
                  htmlFor="confirmPassword"
                  error={fieldErrors.confirmPassword}
                >
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    hasError={!!fieldErrors.confirmPassword}
                  />
                </FormField>
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="footer-links">
              <span className="text-white/50 text-sm">Already have an account?</span>
              {' '}
              <Link to="/login" className="text-link">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop: Satellite Panel for password requirements */}
        <PasswordSatellitePanel password={password} />
        
      </div>
    </div>
  );
}
