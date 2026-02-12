import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { type Event, type CreateEventRequest, type UpdateEventRequest } from "../types";
import { useEventStore } from "../stores/eventStore";

interface EventModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
}

/**
 * EventModalMobile - Full-screen modal for creating/editing events on mobile.
 */
export function EventModalMobile({
  isOpen,
  onClose,
  event,
}: EventModalMobileProps) {
  const { createEvent, updateEvent } = useEventStore();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });
  const [time, setTime] = useState<string>("");
  const [description, setDescription] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!event;

  const normalizeTimeInput = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setTime(event.time ? event.time.slice(0, 5) : "");
      setDescription(event.description || "");
    } else {
      setTitle("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setTime("");
      setDescription("");
    }
    setError("");
    setShowCalendar(false);
  }, [event, isOpen]);

  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDisplayDate = (dateStr: string) => {
    const dateObj = parseLocalDate(dateStr);
    return format(dateObj, "MMM d, yyyy");
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(format(selectedDate, "yyyy-MM-dd"));
      setShowCalendar(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please enter an event title");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isEditing && event) {
        const data: UpdateEventRequest = {
          title: title.trim(),
          date,
          time: time.trim() || null,
          description: description.trim() || null,
        };
        await updateEvent(event.id, data);
      } else {
        const data: CreateEventRequest = {
          title: title.trim(),
          date,
          time: time.trim() || null,
          description: description.trim() || null,
        };
        await createEvent(data);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="mobile-event-modal"
        className="mobile-goal-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="mobile-modal-wrapper">
          {/* Header */}
          <div className="mobile-modal-header">
            <button
              onClick={onClose}
              className="mobile-modal-close"
              aria-label="Close"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h1 className="mobile-modal-title">
              {isEditing ? "Edit Event" : "New Event"}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Scrollable Content */}
          <div className="mobile-modal-content">
            {/* Error */}
            {error && <div className="mobile-modal-error">{error}</div>}

            {/* Event Title */}
            <div className="mobile-field">
              <label className="mobile-label">Event title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Doctor's appointment, Team meeting"
                className="mobile-input"
                autoFocus
              />
            </div>

            {/* Date */}
            <div className="mobile-field">
              <label className="mobile-label">Date</label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="mobile-date-btn"
              >
                <span>{formatDisplayDate(date)}</span>
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Calendar Picker */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mobile-calendar-container"
                >
                  <DayPicker
                    mode="single"
                    selected={parseLocalDate(date)}
                    onSelect={handleDateSelect}
                    weekStartsOn={1}
                    showOutsideDays={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Time */}
            <div className="mobile-field">
              <label className="mobile-label">Time (optional)</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(normalizeTimeInput(e.target.value))}
                inputMode="numeric"
                placeholder="HH:MM"
                maxLength={5}
                className="mobile-input mobile-time-input"
              />
              <p className="mobile-hint">Leave empty for all-day event</p>
            </div>

            {/* Description */}
            <div className="mobile-field">
              <label className="mobile-label">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes or details..."
                maxLength={500}
                className="mobile-textarea"
                rows={4}
              />
              <div className="mobile-char-count">
                {description.length}/500
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mobile-modal-footer">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mobile-submit-btn"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Event"}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
