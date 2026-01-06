import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { addDays, startOfDay, differenceInDays } from "date-fns";

interface ScheduleCalendarProps {
  mode: "days" | "interval";
  scheduleDays?: number[]; // 0=Sun, 6=Sat
  intervalDays?: number;
  intervalStartDate?: string; // YYYY-MM-DD
}

/**
 * ScheduleCalendar - Dark themed calendar visualizer
 * Shows which days goals will be active based on schedule settings
 */
export function ScheduleCalendar({
  mode,
  scheduleDays = [0, 1, 2, 3, 4, 5, 6],
  intervalDays = 2,
  intervalStartDate,
}: ScheduleCalendarProps) {
  // Calculate which dates should be highlighted
  const highlightedDates = useMemo(() => {
    const dates: Date[] = [];
    const today = startOfDay(new Date());
    const endDate = addDays(today, 60); // Show 2 months ahead

    if (mode === "days") {
      // Weekday-based scheduling
      let current = today;
      while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (scheduleDays.includes(dayOfWeek)) {
          dates.push(new Date(current));
        }
        current = addDays(current, 1);
      }
    } else if (mode === "interval" && intervalStartDate) {
      // Interval-based scheduling
      const start = startOfDay(new Date(intervalStartDate));
      let current = start;

      // If start is in the past, find first occurrence from today
      if (current < today) {
        const daysSinceStart = differenceInDays(today, start);
        const cyclesPassed = Math.floor(daysSinceStart / intervalDays);
        current = addDays(start, cyclesPassed * intervalDays);
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

  // Custom day content to show highlighted days
  const modifiers = {
    highlighted: highlightedDates,
    today: new Date(),
  };

  const modifiersClassNames = {
    highlighted: "schedule-day-highlighted",
    today: "schedule-day-today",
  };

  return (
    <div className="schedule-calendar">
      <DayPicker
        mode="multiple"
        selected={highlightedDates}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        showOutsideDays={false}
        fixedWeeks={false}
        numberOfMonths={1}
        disabled={{ before: new Date() }}
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
