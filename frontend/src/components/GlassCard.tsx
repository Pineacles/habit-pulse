import type { ReactNode, MouseEvent } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  solid?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

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