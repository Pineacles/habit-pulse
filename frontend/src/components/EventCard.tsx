import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { type Event } from "../types";
import { useEventStore } from "../stores/eventStore";

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
}

/**
 * EventCard - Agenda row style for event list (time | title + description | actions).
 */
export function EventCard({ event, onEdit }: EventCardProps) {
  const { deleteEvent } = useEventStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Close on any outside click (safety net alongside backdrop)
  useEffect(() => {
    if (!isMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.kebab-menu-container')) {
        closeMenu();
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, [isMenuOpen, closeMenu]);

  const handleDelete = async () => {
    if (confirm(`Delete "${event.title}"? This cannot be undone.`)) {
      await deleteEvent(event.id);
    }
  };

  const formatTimeShort = (time: string): string => {
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  };
  const timeLabel = event.time ? formatTimeShort(event.time) : "All day";
  const isCompleted = event.status === "completed";
  const isCancelled = event.status === "cancelled";

  return (
    <div className="event-agenda-row">
      {/* Time column */}
      <div className="event-agenda-time">
        {timeLabel}
      </div>

      {/* Event info column */}
      <div className="event-agenda-info">
        <h3
          className={`event-agenda-title ${
            isCompleted ? "completed" : ""
          } ${isCancelled ? "cancelled" : ""}`}
        >
          {event.title}
        </h3>
        {event.description && (
          <p className="event-agenda-description">{event.description}</p>
        )}
      </div>

      {/* Actions column */}
      <div className="event-agenda-actions">
        {/* Edit button */}
        <button
          onClick={() => onEdit(event)}
          className="event-action-btn event-action-btn-primary"
          aria-label="Edit event"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        {/* Desktop: Delete button */}
        <div className="event-actions-desktop">
          <button
            onClick={handleDelete}
            className="event-action-btn danger"
            aria-label="Delete event"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile: Kebab menu */}
        <div className="kebab-menu-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((prev) => !prev);
            }}
            className="kebab-menu-btn"
            aria-label="More options"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
          {/* Portal the action sheet to body so position:fixed works
              even inside Framer Motion transform containers */}
          {createPortal(
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="kebab-menu-backdrop"
                    onClick={closeMenu}
                  />
                  <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 60, opacity: 0 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                    className="kebab-menu-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="kebab-menu-handle" />
                    <div className="kebab-menu-items">
                      <button
                        onClick={() => {
                          closeMenu();
                          handleDelete();
                        }}
                        className="kebab-menu-item kebab-menu-item-danger"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}
