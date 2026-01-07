import type { ReactNode, MouseEvent } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  solid?: boolean; // More opaque version for mobile
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  padding?: "none" | "sm" | "md" | "lg";
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
