import type { ReactNode, MouseEvent } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  solid?: boolean; // More opaque version for mobile
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * GlassCard
 * 
 * The core visual element - a frosted glass panel with blur effect.
 * 
 * - Default: High transparency (for desktop, see background through it)
 * - Solid: More opaque (for mobile, better readability outdoors)
 */
export function GlassCard({ 
  children, 
  className = '', 
  solid = false,
  onClick,
  padding = 'md',
}: GlassCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        ${solid ? 'glass-solid' : 'glass'}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer hover:border-white/20 transition-all' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
