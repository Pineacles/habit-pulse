/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

export const LIMITS = {
  /** Maximum characters for goal description */
  DESCRIPTION_MAX_LENGTH: 500,
  /** Default target value for measurable goals */
  DEFAULT_TARGET_VALUE: 30,
  /** Minimum target value */
  MIN_TARGET_VALUE: 1,
  /** Maximum target value */
  MAX_TARGET_VALUE: 999,
  /** Maximum interval days for recurring goals */
  MAX_INTERVAL_DAYS: 365,
  /** Minimum interval days */
  MIN_INTERVAL_DAYS: 1,
} as const;

export const DEFAULTS = {
  /** Default unit for measurable goals */
  UNIT: "minutes",
  /** Default interval for interval scheduling */
  INTERVAL_DAYS: 2,
  /** All days selected (everyday schedule) */
  ALL_DAYS: [0, 1, 2, 3, 4, 5, 6] as number[],
  /** Weekdays only */
  WEEKDAYS: [1, 2, 3, 4, 5] as number[],
  /** Weekend days */
  WEEKENDS: [0, 6] as number[],
} as const;

export const ANIMATION = {
  /** Fast transition duration (seconds) */
  FAST: 0.15,
  /** Normal transition duration (seconds) */
  NORMAL: 0.2,
  /** Slow transition duration (seconds) */
  SLOW: 0.3,
} as const;

export const BREAKPOINTS = {
  /** Mobile breakpoint (px) */
  MOBILE: 640,
  /** Tablet breakpoint (px) */
  TABLET: 768,
  /** Desktop breakpoint (px) */
  DESKTOP: 1024,
} as const;
