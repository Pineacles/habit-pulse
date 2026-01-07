import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { addDays, startOfDay, differenceInDays, isBefore } from "date-fns";

interface ScheduleCalendarProps {
  mode: "days" | "interval";
  scheduleDays?: number[]; // 0=Sun, 6=Sat
  intervalDays?: number;
  intervalStartDate?: string; // "Jan 14" or "2026-01-14"
}

// ROBUST DATE PARSER: Handles "Jan 14", "Jan 14, 2026", and "2026-01-14"
function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  const today = new Date();
  const currentYear = today.getFullYear();

  // 1. Handle "YYYY-MM-DD"
  if (dateStr.includes("-") && dateStr.split("-").length === 3) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  // 2. Handle "Jan 14" or "Jan 14, 2026"
  try {
    const months: { [key: string]: number } = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };

    // Clean up string: remove commas, extra spaces, lowercase it
    const parts = dateStr
      .toLowerCase()
      .replace(/,/g, "")
      .split(" ")
      .filter(Boolean);

    // Look for month and day
    let month = -1;
    let day = -1;
    let year = currentYear; // Default to this year

    parts.forEach((part) => {
      // Is it a month?
      if (months[part.substring(0, 3)] !== undefined) {
        month = months[part.substring(0, 3)];
      }
      // Is it a year? (4 digits)
      else if (!isNaN(Number(part)) && Number(part) > 1900) {
        year = Number(part);
      }
      // Is it a day? (1-31)
      else if (!isNaN(Number(part))) {
        day = Number(part);
      }
    });

    if (month !== -1 && day !== -1) {
      return new Date(year, month, day);
    }
  } catch (e) {
    console.error("Date parse error", e);
  }

  // 3. Fallback
  return new Date();
}

/**
 * ScheduleCalendar - Dark themed calendar visualizer
 */
export function ScheduleCalendar({
  mode,
  scheduleDays = [], // Default to empty to prevent showing ALL days if undefined
  intervalDays = 2,
  intervalStartDate = "",
}: ScheduleCalendarProps) {
  // Calculate highlighted dates
  const highlightedDates = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());

    // Parse the start date using our robust function
    const startDate = startOfDay(parseLocalDate(intervalStartDate));

    // Determine where to start visualizing (Start Date or Today, whichever is later?)
    // Actually, usually we want to show the Schedule starting from the START DATE,
    // even if it's in the future.
    let current = startDate;

    // Show 60 days from the *Start Date* (or Today if Start is way back)
    // If StartDate is in the past, let's catch up to Today.
    if (isBefore(current, today)) {
      current = today;
    }

    const endDate = addDays(current, 60);

    // MODE: Specific Days (e.g. Mon, Wed, Fri)
    if (mode === "days") {
      // Safety check: ensure scheduleDays is valid
      if (!Array.isArray(scheduleDays) || scheduleDays.length === 0) return [];

      while (current <= endDate) {
        // IMPORTANT: Only highlight if >= intervalStartDate
        if (current >= startDate) {
          const dayOfWeek = current.getDay();
          if (scheduleDays.includes(dayOfWeek)) {
            dates.push(new Date(current));
          }
        }
        current = addDays(current, 1);
      }
    }
    // MODE: Interval (e.g. Every 3 days)
    else if (mode === "interval") {
      // Reset current to absolute start date to calculate correct cadence
      current = startDate;

      // If start is in the past, calculate future occurrences without breaking the cycle
      if (current < today) {
        const daysSinceStart = differenceInDays(today, startDate);
        // How many intervals fit in that time?
        const cyclesPassed = Math.floor(daysSinceStart / intervalDays);
        // Jump to the next valid cycle
        current = addDays(startDate, cyclesPassed * intervalDays);

        // If we landed on a day before today, add one more interval
        if (current < today) {
          current = addDays(current, intervalDays);
        }
      }

      while (current <= endDate) {
        dates.push(new Date(current));
        current = addDays(current, intervalDays);
      }
    }

    return dates;
  }, [mode, scheduleDays, intervalDays, intervalStartDate]);

  const modifiers = {
    highlighted: highlightedDates,
  };

  const modifiersClassNames = {
    highlighted: "schedule-day-highlighted",
    today: "schedule-day-today",
  };

  return (
    <div className="schedule-calendar">
      <DayPicker
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        today={startOfDay(new Date())}
        disabled={{ before: startOfDay(new Date()) }}
        defaultMonth={parseLocalDate(intervalStartDate)}
      />

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot active"></span>
          <span>Scheduled</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot today"></span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
