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
    dayNumber: number;
    dateString: string;
    dateObj: Date;
    isOutsideMonth: boolean;
  }> = [];

  // Fill leading cells with previous month dates (instead of invisible blanks)
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = 0; i < leadingBlanks; i++) {
    const day = prevMonthLastDay - leadingBlanks + i + 1;
    const dateObj = new Date(year, monthIndex - 1, day);
    const dateString = format(dateObj, "yyyy-MM-dd");
    cells.push({ dayNumber: day, dateString, dateObj, isOutsideMonth: true });
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, monthIndex, day);
    const dateString = format(dateObj, "yyyy-MM-dd");
    cells.push({ dayNumber: day, dateString, dateObj, isOutsideMonth: false });
  }

  // Fill trailing cells to complete the final week
  const trailingBlanks = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailingBlanks; i++) {
    const dateObj = new Date(year, monthIndex + 1, i);
    const dateString = format(dateObj, "yyyy-MM-dd");
    cells.push({ dayNumber: i, dateString, dateObj, isOutsideMonth: true });
  }

  return cells;
}

/**
 * Formats a time string from the API (HH:MM:SS or HH:MM) to HH:MM display.
 */
function formatTimeShort(time: string): string {
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
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
    eventDays,
    monthEvents,
    viewMode,
    isLoading,
    error,
    fetchMonth,
    goToPrevMonth,
    goToNextMonth,
    setViewMode,
    isDetailsOpen,
    isDetailsLoading,
    selectedDate,
    selectedDayDetails,
    selectedDayEvents,
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

  const eventDaysByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const eventDay of eventDays) {
      map.set(eventDay.date, eventDay.eventCount);
    }
    return map;
  }, [eventDays]);

  // Index full events by date for inline rendering
  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof monthEvents>();
    for (const event of monthEvents) {
      const dateKey = event.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    }
    return map;
  }, [monthEvents]);

  const monthGrid = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);
  const monthLabel = format(currentMonth, "MMMM yyyy");

  const hasAnyScheduledGoals = days.some((d) => d.totalScheduled > 0);

  /** Handles clicking a day cell to show the details popup */
  const handleDayClick = useCallback(
    (dateString: string, dateObj: Date) => {
      // In habits mode only, block future days (events are future-facing)
      if (viewMode === 'habits' && isFuture(dateObj)) return;
      openDayDetails(dateString);
    },
    [openDayDetails, viewMode],
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

      {/* Filter Mode Tabs */}
      <div className="calendar-filter-tabs">
        <button
          onClick={() => setViewMode('habits')}
          className={`calendar-filter-tab ${viewMode === 'habits' ? 'active' : ''}`}
        >
          Habits
        </button>
        <button
          onClick={() => setViewMode('events')}
          className={`calendar-filter-tab ${viewMode === 'events' ? 'active' : ''}`}
        >
          Events
        </button>
        <button
          onClick={() => setViewMode('all')}
          className={`calendar-filter-tab ${viewMode === 'all' ? 'active' : ''}`}
        >
          All
        </button>
      </div>

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
                  if (cell.isOutsideMonth) {
                    return (
                      <div
                        key={`outside-${cell.dateString}-${index}`}
                        className="tracking-calendar-day tracking-calendar-day--outside"
                        aria-hidden="true"
                      >
                        <span className="tracking-calendar-day-number">
                          {cell.dayNumber}
                        </span>
                      </div>
                    );
                  }

                  const dayData = daysByDate.get(cell.dateString);
                  const eventCount = eventDaysByDate.get(cell.dateString) || 0;
                  const cellEvents = eventsByDate.get(cell.dateString) || [];
                  const isTodayCell = isToday(cell.dateObj);
                  const isFutureDay = isFuture(cell.dateObj);

                  // Determine intensity and display based on view mode
                  let intensity: CalendarIntensity = 'empty';
                  let showContent = false;
                  let tooltip = '';

                  if (viewMode === 'habits') {
                    intensity = getIntensity(dayData, cell.dateObj);
                    tooltip = buildTooltip(dayData, cell.dateObj);
                    showContent = Boolean(!isFutureDay && dayData && dayData.totalScheduled > 0);
                  } else if (viewMode === 'events') {
                    // Events are future-facing: show event counts on all days including future
                    intensity = eventCount > 0 ? 'event' : 'empty';
                    tooltip = eventCount > 0 
                      ? `${format(cell.dateObj, 'MMM d, yyyy')}: ${eventCount} event${eventCount > 1 ? 's' : ''}`
                      : `${format(cell.dateObj, 'MMM d, yyyy')}: no events`;
                    showContent = eventCount > 0;
                  } else {
                    // 'all' mode: show habit intensity with event overlay, events shown on future days too
                    intensity = getIntensity(dayData, cell.dateObj);
                    if (isFutureDay) {
                      tooltip = eventCount > 0
                        ? `${format(cell.dateObj, 'MMM d, yyyy')}: ${eventCount} event${eventCount > 1 ? 's' : ''}`
                        : `${format(cell.dateObj, 'MMM d, yyyy')}: no events`;
                    } else {
                      const habitCount = dayData ? `${dayData.completed}/${dayData.totalScheduled} habits` : 'no habits';
                      const eventText = eventCount > 0 ? ` • ${eventCount} event${eventCount > 1 ? 's' : ''}` : '';
                      tooltip = `${format(cell.dateObj, 'MMM d, yyyy')}: ${habitCount}${eventText}`;
                    }
                    // Show content if: (past/today with habits) OR (any day with events)
                    showContent = Boolean((!isFutureDay && dayData && dayData.totalScheduled > 0) || eventCount > 0);
                  }

                  // In habits mode, future days are not clickable; in events/all modes, they are
                  const isClickable = viewMode === 'habits' ? !isFutureDay : true;
                  
                  const classNames = [
                    "tracking-calendar-day",
                    `tracking-calendar-day--${intensity}`,
                    isTodayCell ? "tracking-calendar-day--today" : "",
                    isClickable ? "tracking-calendar-day--clickable" : "",
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
                      whileHover={isClickable ? { scale: 1.08 } : undefined}
                      whileTap={isClickable ? { scale: 0.95 } : undefined}
                      disabled={!isClickable}
                    >
                      <span className="tracking-calendar-day-number">
                        {cell.dayNumber}
                      </span>
                      {showContent && viewMode === 'habits' && dayData && (
                        <span className="tracking-calendar-day-count">
                          {dayData.completed}/{dayData.totalScheduled}
                        </span>
                      )}
                      {/* Events mode: always show count badge + inline titles */}
                      {viewMode === 'events' && eventCount > 0 && (
                        <span className="tracking-calendar-event-badge">
                          {eventCount}
                        </span>
                      )}
                      {showContent && viewMode === 'events' && cellEvents.length > 0 && (
                        <div className="tracking-calendar-day-events">
                          {cellEvents.slice(0, 3).map(evt => (
                            <span key={evt.id} className="tracking-calendar-day-event-title">
                              {evt.time ? `${formatTimeShort(evt.time)} ` : ''}{evt.title}
                            </span>
                          ))}
                        </div>
                      )}
                      {showContent && viewMode === 'all' && (
                        <>
                          {!isFutureDay && dayData && dayData.totalScheduled > 0 && (
                            <span className="tracking-calendar-day-count">
                              {dayData.completed}/{dayData.totalScheduled}
                            </span>
                          )}
                          {eventCount > 0 && (
                            <span className="tracking-calendar-event-dot" />
                          )}
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Empty hint should only appear in habits mode */}
            {viewMode === "habits" && !hasAnyScheduledGoals && (
              <p className="tracking-calendar-empty-hint">
                No goals scheduled this month. Create goals to start tracking.
              </p>
            )}
          </>
        )}

        {/* Legend - context-aware based on viewMode */}
        <div className="tracking-calendar-legend">
          {/* Habit completion legend (habits & all modes) */}
          {(viewMode === 'habits' || viewMode === 'all') && (
            <>
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
            </>
          )}
          
          {/* Event legend (events & all modes) */}
          {(viewMode === 'events' || viewMode === 'all') && (
            <div className="tracking-calendar-legend-item">
              <span className="tracking-calendar-legend-dot tracking-calendar-legend-dot--event" />
              <span>Event</span>
            </div>
          )}
          
          {/* Today marker (all modes) */}
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
                  <p className="calendar-popup-summary">
                    {selectedDayDetails && (
                      <span>
                        {selectedDayDetails.completed}/{selectedDayDetails.totalScheduled} habits
                      </span>
                    )}
                    {selectedDayDetails && selectedDayEvents && selectedDayEvents.events.length > 0 && (
                      <span> • </span>
                    )}
                    {selectedDayEvents && selectedDayEvents.events.length > 0 && (
                      <span>
                        {selectedDayEvents.events.length} event{selectedDayEvents.events.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
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
              ) : (selectedDayDetails || selectedDayEvents) ? (
                <div className="calendar-popup-body">
                  {/* Events Section */}
                  {selectedDayEvents && selectedDayEvents.events.length > 0 && (
                    <div className="calendar-popup-section">
                      <h4 className="calendar-popup-section-title calendar-popup-section-title--events">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Events ({selectedDayEvents.events.length})
                      </h4>
                      <ul className="calendar-popup-event-list">
                        {selectedDayEvents.events.map((event, i) => (
                          <motion.li
                            key={event.id}
                            className="calendar-popup-event"
                            custom={i}
                            variants={listItemVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <div className="calendar-popup-event-time">
                              {event.time ? formatTimeShort(event.time) : 'All day'}
                            </div>
                            <div className="calendar-popup-event-info">
                              <span className="calendar-popup-event-title">{event.title}</span>
                              {event.description && (
                                <span className="calendar-popup-event-description">{event.description}</span>
                              )}
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Done Habits Section */}
                  {selectedDayDetails && (
                  <div className="calendar-popup-section">
                    <h4 className="calendar-popup-section-title calendar-popup-section-title--done">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Done Habits ({selectedDayDetails.done.length})
                    </h4>
                    {selectedDayDetails.done.length > 0 ? (
                      <ul className="calendar-popup-goal-list">
                        {selectedDayDetails.done.map((goal, i) => (
                          <GoalRow key={goal.id} goal={goal} index={i} />
                        ))}
                      </ul>
                    ) : (
                      <p className="calendar-popup-empty">No habits completed</p>
                    )}
                  </div>
                  )}

                  {/* Not Done Habits Section */}
                  {selectedDayDetails && (
                  <div className="calendar-popup-section">
                    <h4 className="calendar-popup-section-title calendar-popup-section-title--not-done">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Not Done Habits ({selectedDayDetails.notDone.length})
                    </h4>
                    {selectedDayDetails.notDone.length > 0 ? (
                      <ul className="calendar-popup-goal-list">
                        {selectedDayDetails.notDone.map((goal, i) => (
                          <GoalRow key={goal.id} goal={goal} index={i} />
                        ))}
                      </ul>
                    ) : (
                      <p className="calendar-popup-empty">All habits completed!</p>
                    )}
                  </div>
                  )}
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
