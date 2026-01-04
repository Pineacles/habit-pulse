import { useMemo } from 'react';

interface PasswordStrengthCheckerProps {
  password: string;
}

interface Requirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

/**
 * PasswordStrengthChecker - Satellite Panel
 * 
 * Desktop: Side panel with checklist
 * Mobile: Inline strength bar
 */
export function PasswordStrengthChecker({ password }: PasswordStrengthCheckerProps) {
  // Define requirements based on modern guidelines
  const requirements: Requirement[] = [
    {
      key: 'length',
      label: 'At least 8 characters',
      test: (p) => p.length >= 8,
    },
    {
      key: 'lengthGood',
      label: '12+ characters',
      test: (p) => p.length >= 12,
    },
    {
      key: 'lowercase',
      label: 'Lowercase letter',
      test: (p) => /[a-z]/.test(p),
    },
    {
      key: 'uppercase',
      label: 'Uppercase letter',
      test: (p) => /[A-Z]/.test(p),
    },
    {
      key: 'number',
      label: 'One number',
      test: (p) => /[0-9]/.test(p),
    },
    {
      key: 'special',
      label: 'Special character',
      test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p),
    },
  ];

  // Calculate which requirements are met
  const results = useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      met: password.length > 0 && req.test(password),
    }));
  }, [password]);

  // Calculate strength score (0-100)
  const strengthScore = useMemo(() => {
    if (password.length === 0) return 0;
    
    let score = 0;
    
    // Length scoring (most important per NIST)
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 15;
    
    // Complexity scoring (optional bonus)
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score += 10;
    
    return Math.min(score, 100);
  }, [password]);

  // Determine strength level
  const strengthLevel = useMemo(() => {
    if (strengthScore < 30) return 'weak';
    if (strengthScore < 50) return 'fair';
    if (strengthScore < 75) return 'good';
    return 'strong';
  }, [strengthScore]);

  const strengthLabels = {
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  };

  // Don't render if no password entered
  if (password.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop: Satellite Panel (rendered in parent via portal or layout) */}
      {/* This component just provides the data - see SatellitePanel below */}
      
      {/* Mobile: Inline strength bar */}
      <div className="password-strength-mobile">
        <div className="strength-bar">
          <div 
            className={`strength-fill ${strengthLevel}`}
            style={{ width: `${strengthScore}%` }}
          />
        </div>
        <span className={`strength-label ${strengthLevel}`}>
          {strengthLabels[strengthLevel]}
        </span>
      </div>
    </>
  );
}

/**
 * SatellitePanel - Desktop password requirements panel
 * Rendered outside the main card
 */
export function PasswordSatellitePanel({ password }: { password: string }) {
  const requirements = [
    { key: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { key: 'lengthGood', label: '12+ characters', test: (p: string) => p.length >= 12 },
    { key: 'lowercase', label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { key: 'uppercase', label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { key: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
    { key: 'special', label: 'Special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p) },
  ];

  const results = requirements.map((req) => ({
    ...req,
    met: password.length > 0 && req.test(password),
  }));

  return (
    <div className="satellite-panel">
      <h4 className="satellite-title">Password Strength</h4>
      <ul className="password-checklist">
        {results.map((req) => (
          <li key={req.key} className={req.met ? 'valid' : 'pending'}>
            <span>{req.met ? '✓' : '○'}</span>
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
