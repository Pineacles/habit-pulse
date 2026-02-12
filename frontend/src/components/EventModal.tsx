import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { type Event, type CreateEventRequest, type UpdateEventRequest } from "../types";
import { useEventStore } from "../stores/eventStore";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
}

const spring = { type: "spring", stiffness: 400, damping: 30 };

export function EventModal({ isOpen, onClose, event }: EventModalProps) {
  const { createEvent, updateEvent } = useEventStore();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640;
    }
    return false;
  });

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [time, setTime] = useState<string>("");
  const [description, setDescription] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDate(event.date);
      setTime(event.time ? event.time.slice(0, 5) : "");
      setDescription(event.description || "");
    } else {
      setTitle("");
      const today = new Date();
      setDate(format(today, "yyyy-MM-dd"));
      setTime("");
      setDescription("");
    }
    setError("");
    setShowCalendar(false);
  }, [event, isOpen]);

  const isEditing = !!event;

  const normalizeTimeInput = (value: string): string => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

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
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);
      setShowCalendar(false);
    }
  };

  const setToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setDate(`${year}-${month}-${day}`);
    setShowCalendar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  // Redirect to mobile modal if on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        layout
        transition={spring}
        className="modal-flex-container"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div layout="position" className="modal-main-card">
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? "Edit Event" : "New Event"}
              </h2>
              <button type="button" onClick={onClose} className="modal-close">
                <svg
                  className="icon icon-md"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {error && <div className="modal-error">{error}</div>}

            <div className="modal-section">
              <label className="modal-label">Event Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Doctor's appointment, Team meeting"
                autoFocus
                className="modal-input"
              />
            </div>

            <div className="modal-section">
              <label className="modal-label">Date</label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className={`start-date-btn ${showCalendar ? "active" : ""}`}
              >
                <span className="start-date-label">Event Date</span>
                <span className="start-date-value">
                  {formatDisplayDate(date)}
                  {showCalendar && <span className="pulse-dot" />}
                </span>
                <svg
                  className="calendar-icon"
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

            <div className="modal-section">
              <label className="modal-label">Time (Optional)</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(normalizeTimeInput(e.target.value))}
                inputMode="numeric"
                placeholder="HH:MM"
                maxLength={5}
                className="modal-input modal-time-input"
              />
              <p className="modal-hint">Leave empty for all-day event</p>
            </div>

            <div className="modal-section">
              <label className="modal-label">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes or details about this event..."
                maxLength={500}
                className="modal-textarea"
                rows={4}
              />
              <div className="char-count-right">
                {description.length}/500
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glow"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Create Event"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Calendar Drawer */}
        {showCalendar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={spring}
            className="calendar-drawer"
          >
            <div className="calendar-drawer-inner">
              <div className="calendar-drawer-header">
                <span className="calendar-drawer-title">Select date</span>
              </div>

              <DayPicker
                mode="single"
                selected={parseLocalDate(date)}
                onSelect={handleDateSelect}
                weekStartsOn={1}
                showOutsideDays={false}
              />

              <div className="calendar-quick-actions">
                <button
                  type="button"
                  onClick={setToday}
                  className="calendar-action-btn"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="calendar-action-btn secondary"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
