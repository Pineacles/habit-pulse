import { useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  getDay,
  getDaysInMonth,
  startOfMonth,
  isToday,
  isFuture,
  parseISO,
} from "date-fns";
import { useCalendarStore } from "../stores/calendarStore";
import type { CalendarDay, CalendarIntensity, CalendarGoalItem } from "../types";
import "../styles/components/tracking-calendar.css";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Monday-first weekday labels */
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ------------------------------------------------------------------ */
/*  Pure Helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Converts JavaScript's Sunday-first day index (0=Sun) to a
 * Monday-first column index (0=Mon … 6=Sun).
 */
function toMondayIndex(jsDayOfWeek: number): number {
  return (jsDayOfWeek + 6) % 7;
}

/**
 * Maps a CalendarDay to a color intensity based on completion ratio.
 * Thresholds: >= 80 % green, >= 30 % yellow, < 30 % red.
 */
function getIntensity(day: CalendarDay | undefined, dateObj: Date): CalendarIntensity {
  if (isFuture(dateObj)) return "future";
  if (!day || day.totalScheduled === 0) return "empty";

  const ratio = day.completed / day.totalScheduled;
  if (ratio >= 0.8) return "green";
  if (ratio >= 0.3) return "yellow";
  return "red";
}

/**
 * Builds a readable tooltip string for a given calendar day.
 */
function buildTooltip(day: CalendarDay | undefined, dateObj: Date): string {
  const label = format(dateObj, "MMM d, yyyy");

  if (isFuture(dateObj)) return `${label}: upcoming`;
  if (!day || day.totalScheduled === 0) return `${label}: no goals scheduled`;

  const percent = Math.round((day.completed / day.totalScheduled) * 100);
  return `${label}: ${day.completed} of ${day.totalScheduled} goals completed (${percent}%)`;
}

/**
 * Returns an array of grid cells for a month view (Monday-first).
 * Leading empty cells align the 1st to the correct weekday column.
 */
function buildMonthGrid(month: Date) {
  const totalDays = getDaysInMonth(month);
  const firstWeekday = getDay(startOfMonth(month)); // 0 = Sun
  const leadingBlanks = toMondayIndex(firstWeekday);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const cells: Array<{
    dayNumber: number | null;
    dateString: string;
    dateObj: Date;
  }> = [];

  for (let i = 0; i < leadingBlanks; i++) {
    cells.push({ dayNumber: null, dateString: "", dateObj: new Date(0) });
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, monthIndex, day);
    const dateString = format(dateObj, "yyyy-MM-dd");
    cells.push({ dayNumber: day, dateString, dateObj });
  }

  return cells;
}

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const gridVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const popupVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 350 },
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.2 },
  }),
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** A single goal row inside the day-details popup */
function GoalRow({ goal, index }: { goal: CalendarGoalItem; index: number }) {
  return (
    <motion.li
      className="calendar-popup-goal"
      custom={index}
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
    >
      <span className="calendar-popup-goal-name">{goal.name}</span>
      {goal.isMeasurable && (
        <span className="calendar-popup-goal-target">
          {goal.targetValue} {goal.unit}
        </span>
      )}
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

/**
 * Calendar - Full-page month view showing daily goal completion as
 * color-coded squares (green / yellow / red). Click a day for details.
 */
export function Calendar() {
  const {
    currentMonth,
    days,
    isLoading,
    error,
    fetchMonth,
    goToPrevMonth,
    goToNextMonth,
    isDetailsOpen,
    isDetailsLoading,
    selectedDate,
    selectedDayDetails,
    openDayDetails,
    closeDayDetails,
  } = useCalendarStore();

  // Fetch data for the current month on mount
  useEffect(() => {
    fetchMonth(currentMonth);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Index calendar data by date string for O(1) lookup
  const daysByDate = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    for (const day of days) {
      map.set(day.date, day);
    }
    return map;
  }, [days]);

  const monthGrid = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const monthLabel = format(currentMonth, "MMMM yyyy");

  const hasAnyScheduledGoals = days.some((d) => d.totalScheduled > 0);

  /** Handles clicking a day cell to show the details popup */
  const handleDayClick = useCallback(
    (dateString: string, dateObj: Date) => {
      // Don't open details for future days or days without data
      if (isFuture(dateObj)) return;
      openDayDetails(dateString);
    },
    [openDayDetails],
  );

  /** Formatted label for the popup header */
  const popupDateLabel = selectedDate
    ? format(parseISO(selectedDate), "EEEE, MMM d, yyyy")
    : "";

  return (
    <div className="calendar-page-view">
      {/* Page Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="page-header-mobile-top">
          <div className="page-header-title-section">
            <h1 className="page-title">Calendar</h1>
            <p className="page-subtitle">Track your daily progress</p>
          </div>
        </div>
        <div className="page-header-desktop-title">
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Track your daily progress</p>
        </div>
      </motion.div>

      {/* Calendar Body */}
      <div className="tracking-calendar">
        {/* Month Navigation Header */}
        <div className="tracking-calendar-header">
          <button
            className="tracking-calendar-nav"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="tracking-calendar-title">{monthLabel}</h2>

          <button
            className="tracking-calendar-nav"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Weekday Labels (Monday-first) */}
        <div className="tracking-calendar-weekdays">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="tracking-calendar-weekday">
              {label}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        {isLoading ? (
          <div className="tracking-calendar-loading">Loading...</div>
        ) : error ? (
          <div className="tracking-calendar-loading">{error}</div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={monthLabel}
                className="tracking-calendar-grid"
                variants={gridVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {monthGrid.map((cell, index) => {
                  if (cell.dayNumber === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="tracking-calendar-day tracking-calendar-day--outside"
                      />
                    );
                  }

                  const dayData = daysByDate.get(cell.dateString);
                  const intensity = getIntensity(dayData, cell.dateObj);
                  const isTodayCell = isToday(cell.dateObj);
                  const tooltip = buildTooltip(dayData, cell.dateObj);
                  const isFutureDay = isFuture(cell.dateObj);

                  const showCount =
                    !isFutureDay && dayData && dayData.totalScheduled > 0;

                  const classNames = [
                    "tracking-calendar-day",
                    `tracking-calendar-day--${intensity}`,
                    isTodayCell ? "tracking-calendar-day--today" : "",
                    !isFutureDay ? "tracking-calendar-day--clickable" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <motion.button
                      key={cell.dateString}
                      className={classNames}
                      title={tooltip}
                      aria-label={tooltip}
                      role="gridcell"
                      onClick={() => handleDayClick(cell.dateString, cell.dateObj)}
                      whileHover={!isFutureDay ? { scale: 1.08 } : undefined}
                      whileTap={!isFutureDay ? { scale: 0.95 } : undefined}
                      disabled={isFutureDay}
                    >
                      <span className="tracking-calendar-day-number">
                        {cell.dayNumber}
                      </span>
                      {showCount && (
                        <span className="tracking-calendar-day-count">
                          {dayData!.completed}/{dayData!.totalScheduled}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Empty hint when no goals exist */}
            {!hasAnyScheduledGoals && (
              <p className="tracking-calendar-empty-hint">
                No goals scheduled this month. Create goals to start tracking.
              </p>
            )}
          </>
        )}

        {/* Legend */}
        <div className="tracking-calendar-legend">
          <div className="tracking-calendar-legend-item">
            <span className="tracking-calendar-legend-dot tracking-calendar-legend-dot--green" />
            <span>&ge; 80%</span>
          </div>
          <div className="tracking-calendar-legend-item">
            <span className="tracking-calendar-legend-dot tracking-calendar-legend-dot--yellow" />
            <span>30-79%</span>
          </div>
          <div className="tracking-calendar-legend-item">
            <span className="tracking-calendar-legend-dot tracking-calendar-legend-dot--red" />
            <span>&lt; 30%</span>
          </div>
          <div className="tracking-calendar-legend-item">
            <span className="tracking-calendar-legend-dot tracking-calendar-legend-dot--today" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Day Details Popup / Modal */}
      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            className="calendar-popup-backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeDayDetails}
          >
            <motion.div
              className="calendar-popup-panel"
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Popup Header */}
              <div className="calendar-popup-header">
                <div>
                  <h3 className="calendar-popup-title">{popupDateLabel}</h3>
                  {selectedDayDetails && (
                    <p className="calendar-popup-summary">
                      {selectedDayDetails.completed} / {selectedDayDetails.totalScheduled} goals
                      completed
                    </p>
                  )}
                </div>
                <button
                  className="calendar-popup-close"
                  onClick={closeDayDetails}
                  aria-label="Close day details"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Popup Body */}
              {isDetailsLoading ? (
                <div className="calendar-popup-loading">Loading...</div>
              ) : selectedDayDetails ? (
                <div className="calendar-popup-body">
                  {/* Done Section */}
                  <div className="calendar-popup-section">
                    <h4 className="calendar-popup-section-title calendar-popup-section-title--done">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Done ({selectedDayDetails.done.length})
                    </h4>
                    {selectedDayDetails.done.length > 0 ? (
                      <ul className="calendar-popup-goal-list">
                        {selectedDayDetails.done.map((goal, i) => (
                          <GoalRow key={goal.id} goal={goal} index={i} />
                        ))}
                      </ul>
                    ) : (
                      <p className="calendar-popup-empty">No goals completed</p>
                    )}
                  </div>

                  {/* Not Done Section */}
                  <div className="calendar-popup-section">
                    <h4 className="calendar-popup-section-title calendar-popup-section-title--not-done">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Not Done ({selectedDayDetails.notDone.length})
                    </h4>
                    {selectedDayDetails.notDone.length > 0 ? (
                      <ul className="calendar-popup-goal-list">
                        {selectedDayDetails.notDone.map((goal, i) => (
                          <GoalRow key={goal.id} goal={goal} index={i} />
                        ))}
                      </ul>
                    ) : (
                      <p className="calendar-popup-empty">All goals completed!</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="calendar-popup-loading">No data available</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
