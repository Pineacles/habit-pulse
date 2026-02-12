import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, isYesterday, isPast, startOfDay, addWeeks, parseISO } from 'date-fns';
import { EventCard } from '../components/EventCard';
import { EventModal } from '../components/EventModal';
import { EventModalMobile } from '../components/EventModalMobile';
import { useEventStore } from '../stores/eventStore';
import { type Event } from '../types';
import '../styles/components/events.css';

type FilterType = 'all' | 'today' | 'week' | 'month';

/**
 * Events - Infinite Agenda view with sticky date headers, search, and filters.
 */
export function Events() {
  const { events, isLoading, fetchEvents } = useEventStore();
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>(() => {
    // Initialize filter from URL query param
    const urlFilter = searchParams.get('filter');
    return (urlFilter === 'today' || urlFilter === 'week' || urlFilter === 'month') ? urlFilter : 'all';
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    // Fetch all events (no date filter for agenda view)
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  // Filter and search events
  const today = new Date().toISOString().split('T')[0];
  const filteredAndSearchedEvents = useMemo(() => {
    let result = [...events];

    // Apply date range filter
    if (filter === 'today') {
      result = result.filter((e) => e.date === today);
    } else if (filter === 'week') {
      result = result.filter((e) => isThisWeek(parseISO(e.date), { weekStartsOn: 1 }));
    } else if (filter === 'month') {
      result = result.filter((e) => isThisMonth(parseISO(e.date)));
    }

    // Apply search filter (case-insensitive on title and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          (e.description && e.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [events, filter, searchQuery, today]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const event of filteredAndSearchedEvents) {
      if (!map.has(event.date)) {
        map.set(event.date, []);
      }
      map.get(event.date)!.push(event);
    }

    // Sort events within each day by time (all-day events first, then by time)
    for (const [, dayEvents] of map) {
      dayEvents.sort((a, b) => {
        if (!a.time && b.time) return -1; // all-day first
        if (a.time && !b.time) return 1;
        if (!a.time && !b.time) return 0;
        return (a.time || '').localeCompare(b.time || '');
      });
    }

    return map;
  }, [filteredAndSearchedEvents]);

  // Get sorted date keys
  const sortedDates = useMemo(() => {
    return Array.from(eventsByDate.keys()).sort();
  }, [eventsByDate]);

  // Build agenda structure with time gap separators
  interface AgendaItem {
    type: 'date-header' | 'event' | 'separator';
    date?: string;
    dateLabel?: string;
    event?: Event;
    separatorLabel?: string;
  }

  /**
   * Classifies a date into a semantic bucket relative to today.
   * Returns a label for the separator between groups.
   */
  const getDateBucket = (dateObj: Date): string => {
    const todayStart = startOfDay(new Date());
    if (isToday(dateObj)) return 'today';
    if (isYesterday(dateObj)) return 'yesterday';
    if (isTomorrow(dateObj)) return 'tomorrow';

    // Past dates
    if (isPast(dateObj)) {
      if (isThisWeek(dateObj, { weekStartsOn: 1 })) return 'earlier_this_week';
      if (isThisMonth(dateObj)) return 'earlier_this_month';
      return format(dateObj, 'MMMM yyyy');
    }

    // Future dates
    if (isThisWeek(dateObj, { weekStartsOn: 1 })) return 'later_this_week';
    const nextWeekEnd = addWeeks(todayStart, 2);
    if (dateObj < nextWeekEnd) return 'next_week';
    if (isThisMonth(dateObj)) return 'later_this_month';
    return format(dateObj, 'MMMM yyyy');
  };

  /** Human-readable label for separator buckets */
  const bucketLabel = (bucket: string): string => {
    switch (bucket) {
      case 'today': return '';              // no separator needed
      case 'yesterday': return 'Yesterday';
      case 'tomorrow': return 'Tomorrow';
      case 'earlier_this_week': return 'Earlier This Week';
      case 'earlier_this_month': return 'Earlier This Month';
      case 'later_this_week': return 'Later This Week';
      case 'next_week': return 'Next Week';
      case 'later_this_month': return 'Later This Month';
      default: return bucket;               // "February 2026" etc.
    }
  };

  const agendaItems = useMemo(() => {
    const items: AgendaItem[] = [];
    let lastBucket: string | null = null;

    for (const dateString of sortedDates) {
      const dateObj = parseISO(dateString);
      const dayEvents = eventsByDate.get(dateString)!;

      // Determine which bucket this date belongs to
      const bucket = getDateBucket(dateObj);

      // Insert separators only between groups (not before first header)
      if (bucket !== lastBucket) {
        if (lastBucket !== null) {
          const label = bucketLabel(bucket);
          if (label) {
            items.push({ type: 'separator', separatorLabel: label });
          }
        }
        lastBucket = bucket;
      }

      // Date header
      let dateLabel = '';
      if (isToday(dateObj)) {
        dateLabel = `Today, ${format(dateObj, 'MMMM d')}`;
      } else if (isTomorrow(dateObj)) {
        dateLabel = `Tomorrow, ${format(dateObj, 'MMMM d')}`;
      } else if (isYesterday(dateObj)) {
        dateLabel = `Yesterday, ${format(dateObj, 'MMMM d')}`;
      } else {
        dateLabel = format(dateObj, 'EEEE, MMMM d');
      }

      items.push({
        type: 'date-header',
        date: dateString,
        dateLabel,
      });

      // Events for this day
      for (const event of dayEvents) {
        items.push({
          type: 'event',
          event,
        });
      }
    }

    return items;
  }, [sortedDates, eventsByDate]);

  return (
    <>
      {/* Page Header */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">Track your important dates</p>
        </div>
        {/* Desktop: New Event button */}
        <div className="page-header-desktop">
          <button onClick={() => setIsModalOpen(true)} className="btn-glow">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Event
          </button>
        </div>
      </motion.div>

      {/* Mobile: Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fab-add-goal ${isModalOpen ? 'fab-hidden' : ''}`}
        aria-label="New Event"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Search and Filter Controls */}
      {events.length > 0 && (
        <div className="events-controls">
          {/* Search Bar */}
          <div className="events-search-bar">
            <svg
              className="events-search-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="events-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="events-search-clear"
                aria-label="Clear search"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="events-filter-chips">
            <button
              onClick={() => setFilter('all')}
              className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`filter-chip ${filter === 'today' ? 'active' : ''}`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`filter-chip ${filter === 'week' ? 'active' : ''}`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`filter-chip ${filter === 'month' ? 'active' : ''}`}
            >
              This Month
            </button>
          </div>
        </div>
      )}

      {/* Infinite Agenda Scroll */}
      <div className="events-page events-agenda">
        {isLoading && events.length === 0 ? (
          // Loading
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="event-card animate-pulse">
                <div className="h-6 w-40 bg-white/10 rounded mb-2" />
                <div className="h-4 w-24 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : agendaItems.length === 0 ? (
          // Empty state
          <div className="empty-state">
            <div className="empty-state-icon-text">
              <span>HP</span>
              <span className="dot">.</span>
            </div>
            {events.length === 0 ? (
              <>
                <h3 className="empty-state-title">No events yet</h3>
                <p className="empty-state-text">
                  Create events to track important dates and milestones
                </p>
                <button onClick={() => setIsModalOpen(true)} className="btn-glow">
                  Create Your First Event
                </button>
              </>
            ) : (
              <>
                <h3 className="empty-state-title">No events found</h3>
                <p className="empty-state-text">
                  Try adjusting your search or filter
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('all');
                  }}
                  className="btn-glow"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          // Agenda items
          <div className="events-agenda-scroll">
            {agendaItems.map((item, index) => {
              if (item.type === 'separator') {
                return (
                  <div key={`sep-${index}`} className="events-agenda-separator">
                    <span>{item.separatorLabel}</span>
                  </div>
                );
              }

              if (item.type === 'date-header') {
                return (
                  <div
                    key={`header-${item.date}`}
                    className="events-agenda-date-header"
                  >
                    {item.dateLabel}
                  </div>
                );
              }

              // Event row
              return (
                <motion.div
                  key={item.event!.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.02, 0.3),
                  }}
                >
                  <EventCard event={item.event!} onEdit={handleEdit} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event modal */}
      {isMobile ? (
        <EventModalMobile
          isOpen={isModalOpen}
          onClose={handleModalClose}
          event={editingEvent}
        />
      ) : (
        <EventModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          event={editingEvent}
        />
      )}
    </>
  );
}
