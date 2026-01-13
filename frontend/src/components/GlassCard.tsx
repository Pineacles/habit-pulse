import type { ReactNode, MouseEvent } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  solid?: boolean; // More opaque version for mobile
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * GlassCard - Frosted glass panel component with optional solid variant.
 */
export function GlassCard({
  children,
  className = "",
  solid = false,
  onClick,
  padding = "md",
}: GlassCardProps) {
  const paddingClasses: Record<
    NonNullable<GlassCardProps["padding"]>,
    string
  > = {
    none: "glass-card--pad-none",
    sm: "glass-card--pad-sm",
    md: "glass-card--pad-md",
    lg: "glass-card--pad-lg",
  };

  return (
    <div
      className={[
        "glass-card",
        solid ? "glass-card--solid" : "glass-card--default",
        paddingClasses[padding],
        onClick ? "glass-card--clickable" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
