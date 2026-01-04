import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/**
 * FormField
 * 
 * Reusable form field wrapper that provides:
 * - Consistent label styling
 * - Error message display with aria-live for screen readers
 * - Optional hint text
 * - Proper accessibility associations
 */
export function FormField({ 
  label, 
  htmlFor, 
  error, 
  hint, 
  children 
}: FormFieldProps) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;

  return (
    <div className="form-field">
      <label 
        htmlFor={htmlFor} 
        className="form-field-label"
      >
        {label}
      </label>
      
      {children}
      
      {/* Error message with aria-live for screen readers */}
      {error && (
        <div 
          id={errorId}
          className="form-field-error"
          role="alert"
          aria-live="polite"
        >
          <svg 
            className="w-4 h-4" 
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
      
      {/* Hint text */}
      {hint && !error && (
        <p id={hintId} className="form-field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
