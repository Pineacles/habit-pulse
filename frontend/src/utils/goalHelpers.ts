import { addDays, startOfDay, differenceInDays, format } from "date-fns";
import { DAY_NAMES_SHORT, type Goal } from "../types";

/**
 * Shared unit label abbreviations for display
 */
export const UNIT_LABELS: Record<string, string> = {
  minutes: "min",
  pages: "pg",
  reps: "reps",
  liters: "L",
  km: "km",
  items: "items",
};

/**
 * Parse a date string (YYYY-MM-DD) to a local Date object
 * Avoids timezone issues by using local date parts
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a date string for display (e.g., "Jan 14")
 */
export function formatDisplayDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Calculate the next occurrence date for interval-based schedules
 * Returns null if calculation fails
 */
export function getNextOccurrence(
  intervalDays: number,
  intervalStartDate: string
): Date | null {
  try {
    const startDate = parseLocalDate(intervalStartDate);
    const today = startOfDay(new Date());
    const start = startOfDay(startDate);

    // If start is in the future, that's the next occurrence
    if (start >= today) {
      return start;
    }

    // Calculate how many intervals have passed
    const daysSinceStart = differenceInDays(today, start);
    const cyclesPassed = Math.floor(daysSinceStart / intervalDays);

    // Calculate the next occurrence
    let nextOccurrence = addDays(start, cyclesPassed * intervalDays);

    // If we landed on today or before, add one more interval
    if (nextOccurrence < today) {
      nextOccurrence = addDays(nextOccurrence, intervalDays);
    }

    return nextOccurrence;
  } catch (e) {
    console.error("Error calculating next occurrence:", e);
    return null;
  }
}

/**
 * Format schedule display text based on goal settings
 */
export function formatSchedule(goal: Pick<Goal, "intervalDays" | "intervalStartDate" | "scheduleDays">): string {
  // Check for interval schedule first
  if (goal.intervalDays && goal.intervalStartDate) {
    const nextOccurrence = getNextOccurrence(goal.intervalDays, goal.intervalStartDate);
    if (nextOccurrence) {
      const formattedDate = format(nextOccurrence, "MMM d");
      const today = startOfDay(new Date());
      const isToday = startOfDay(nextOccurrence).getTime() === today.getTime();
      return `Every ${goal.intervalDays} days${isToday ? " (Today)" : ` (Next: ${formattedDate})`}`;
    }
    return `Every ${goal.intervalDays} days`;
  }

  const days = goal.scheduleDays;
  if (days.length === 7) return "Every day";
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "Weekdays";
  if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";
  return days.map((d) => DAY_NAMES_SHORT[d]).join(", ");
}

/**
 * Format target value display (e.g., "30min", "10pg")
 * Returns "Simple" for non-measurable goals
 */
export function formatTarget(goal: Pick<Goal, "isMeasurable" | "targetValue" | "unit">): string | null {
  if (!goal.isMeasurable) {
    return null;
  }
  return `${goal.targetValue}${UNIT_LABELS[goal.unit] || goal.unit}`;
}

/**
 * Format target with "Simple" label for non-measurable goals
 * Used in AllGoals page
 */
export function formatTargetWithLabel(goal: Pick<Goal, "isMeasurable" | "targetValue" | "unit">): string {
  if (!goal.isMeasurable) {
    return "Simple";
  }
  return `${goal.targetValue}${UNIT_LABELS[goal.unit] || goal.unit}`;
}
