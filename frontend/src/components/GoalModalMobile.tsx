import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DayPicker } from "react-day-picker";
import {
  DAY_NAMES,
  UNIT_OPTIONS,
  type GoalWithStatus,
  type CreateGoalRequest,
  type UpdateGoalRequest,
} from "../types";
import { useGoalStore } from "../stores/goalStore";

interface GoalModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: GoalWithStatus | null;
}

type ScheduleType = "daily" | "weekdays" | "weekends" | "custom" | "interval";

/**
 * GoalModalMobile - Full-screen modal for creating/editing goals on mobile.
 */
export function GoalModalMobile({
  isOpen,
  onClose,
  goal,
}: GoalModalMobileProps) {
  const { createGoal, updateGoal } = useGoalStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isMeasurable, setIsMeasurable] = useState(false);
  const [targetValue, setTargetValue] = useState(30);
  const [unit, setUnit] = useState("minutes");
  const [scheduleType, setScheduleType] = useState<ScheduleType>("daily");
  const [scheduleDays, setScheduleDays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [intervalDays, setIntervalDays] = useState(2);
  const [intervalStartDate, setIntervalStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setDescription(goal.description || "");
      setIsMeasurable(goal.isMeasurable);
      setTargetValue(goal.targetValue || 30);
      setUnit(goal.unit || "minutes");
      setScheduleDays([...goal.scheduleDays]);

      if (goal.intervalDays && goal.intervalStartDate) {
        setScheduleType("interval");
        setIntervalDays(goal.intervalDays);
        setIntervalStartDate(goal.intervalStartDate);
      } else if (goal.scheduleDays.length === 7) {
        setScheduleType("daily");
      } else if (
        goal.scheduleDays.length === 5 &&
        !goal.scheduleDays.includes(0) &&
        !goal.scheduleDays.includes(6)
      ) {
        setScheduleType("weekdays");
      } else if (
        goal.scheduleDays.length === 2 &&
        goal.scheduleDays.includes(0) &&
        goal.scheduleDays.includes(6)
      ) {
        setScheduleType("weekends");
      } else {
        setScheduleType("custom");
      }
    } else {
      setName("");
      setDescription("");
      setIsMeasurable(false);
      setTargetValue(30);
      setUnit("minutes");
      setScheduleType("daily");
      setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
      setIntervalDays(2);
      setIntervalStartDate(new Date().toISOString().split("T")[0]);
    }
    setError("");
    setShowCalendar(false);
  }, [goal, isOpen]);

  const handleScheduleChange = (type: ScheduleType) => {
    setScheduleType(type);
    setShowCalendar(false);
    switch (type) {
      case "daily":
        setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
        break;
      case "weekdays":
        setScheduleDays([1, 2, 3, 4, 5]);
        break;
      case "weekends":
        setScheduleDays([0, 6]);
        break;
      case "custom":
      case "interval":
        break;
    }
  };

  // Toggle a day
  const toggleDay = (day: number) => {
    if (scheduleDays.includes(day)) {
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter((d) => d !== day));
      }
    } else {
      setScheduleDays([...scheduleDays, day].sort());
    }
  };

  const adjustValue = (delta: number) => {
    setTargetValue((prev) => Math.max(1, Math.min(999, prev + delta)));
  };

  const adjustInterval = (delta: number) => {
    setIntervalDays((prev) => Math.max(1, Math.min(365, prev + delta)));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setIntervalStartDate(`${year}-${month}-${day}`);
      setShowCalendar(false);
    }
  };

  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter a habit name");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const useInterval = scheduleType === "interval";

      if (isEditing && goal) {
        const data: UpdateGoalRequest = {
          name: name.trim(),
          isMeasurable,
          targetValue: isMeasurable ? targetValue : 0,
          unit: isMeasurable ? unit : "minutes",
          scheduleDays: useInterval ? [0, 1, 2, 3, 4, 5, 6] : scheduleDays,
          intervalDays: useInterval ? intervalDays : null,
          intervalStartDate: useInterval ? intervalStartDate : null,
          description: description.trim() || null,
        };
        await updateGoal(goal.id, data);
      } else {
        const data: CreateGoalRequest = {
          name: name.trim(),
          isMeasurable,
          targetValue: isMeasurable ? targetValue : 0,
          unit: isMeasurable ? unit : "minutes",
          scheduleDays: useInterval ? [0, 1, 2, 3, 4, 5, 6] : scheduleDays,
          intervalDays: useInterval ? intervalDays : null,
          intervalStartDate: useInterval ? intervalStartDate : null,
          description: description.trim() || null,
        };
        await createGoal(data);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-goal-modal"
          className="mobile-goal-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="mobile-modal-header">
            <button
              type="button"
              onClick={onClose}
              className="mobile-modal-back"
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
              {isEditing ? "Edit Habit" : "New Habit"}
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Scrollable Content */}
          <div className="mobile-modal-content">
            {/* Error */}
            {error && <div className="mobile-modal-error">{error}</div>}

            {/* Habit Name */}
            <div className="mobile-field">
              <label className="mobile-label">What's your habit?</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Meditate, Read, Exercise"
                className="mobile-input"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="mobile-field">
              <label className="mobile-label">
                Description{" "}
                <span className="mobile-label-optional">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes or details..."
                className="mobile-textarea"
                rows={2}
                maxLength={500}
              />
            </div>

            {/* Habit Type */}
            <div className="mobile-field">
              <label className="mobile-label">Habit type</label>
              <div className="mobile-toggle-group">
                <button
                  type="button"
                  className={`mobile-toggle-btn ${
                    !isMeasurable ? "active" : ""
                  }`}
                  onClick={() => setIsMeasurable(false)}
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Simple</span>
                  <span className="mobile-toggle-desc">Just check it off</span>
                </button>
                <button
                  type="button"
                  className={`mobile-toggle-btn ${
                    isMeasurable ? "active" : ""
                  }`}
                  onClick={() => setIsMeasurable(true)}
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Measurable</span>
                  <span className="mobile-toggle-desc">Track a target</span>
                </button>
              </div>
            </div>

            {/* Target (if measurable) */}
            <AnimatePresence>
              {isMeasurable && (
                <motion.div
                  className="mobile-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="mobile-label">Daily target</label>
                  <div className="mobile-target-row">
                    <div className="mobile-stepper">
                      <button
                        type="button"
                        className="mobile-stepper-btn"
                        onClick={() => adjustValue(-5)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={targetValue}
                        onChange={(e) =>
                          setTargetValue(parseInt(e.target.value) || 1)
                        }
                        className="mobile-stepper-input"
                        min={1}
                        max={999}
                        size={String(targetValue).length || 1}
                        style={{
                          width: `${
                            Math.max(String(targetValue).length || 1, 2) * 0.6 +
                            0.8
                          }em`,
                        }}
                      />
                      <button
                        type="button"
                        className="mobile-stepper-btn"
                        onClick={() => adjustValue(5)}
                      >
                        +
                      </button>
                    </div>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="mobile-select"
                    >
                      {UNIT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mobile-presets">
                    {[15, 30, 45, 60].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTargetValue(val)}
                        className={`mobile-preset ${
                          targetValue === val ? "active" : ""
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Schedule */}
            <div className="mobile-field">
              <label className="mobile-label">How often?</label>
              <div className="mobile-schedule-chips">
                {(
                  [
                    "daily",
                    "weekdays",
                    "weekends",
                    "custom",
                    "interval",
                  ] as const
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleScheduleChange(type)}
                    className={`mobile-schedule-chip ${
                      scheduleType === type ? "active" : ""
                    }`}
                  >
                    {type === "daily" && "Every Day"}
                    {type === "weekdays" && "Weekdays"}
                    {type === "weekends" && "Weekends"}
                    {type === "custom" && "Custom"}
                    {type === "interval" && "Interval"}
                  </button>
                ))}
              </div>

              {/* Custom days */}
              <AnimatePresence>
                {scheduleType === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mobile-days-section"
                  >
                    <div className="mobile-days-grid">
                      {DAY_NAMES.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleDay(index)}
                          className={`mobile-day-btn ${
                            scheduleDays.includes(index) ? "active" : ""
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interval */}
              <AnimatePresence>
                {scheduleType === "interval" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mobile-interval-section"
                  >
                    <div className="mobile-interval-row">
                      <span className="mobile-interval-text">Repeat every</span>
                      <div className="mobile-stepper compact">
                        <button
                          type="button"
                          className="mobile-stepper-btn"
                          onClick={() => adjustInterval(-1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={intervalDays}
                          onChange={(e) =>
                            setIntervalDays(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="mobile-stepper-input"
                          min={1}
                          max={365}
                          size={String(intervalDays).length || 1}
                          style={{
                            width: `${
                              Math.max(String(intervalDays).length || 1, 2) *
                                0.6 +
                              0.8
                            }em`,
                          }}
                        />
                        <button
                          type="button"
                          className="mobile-stepper-btn"
                          onClick={() => adjustInterval(1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="mobile-interval-text">days</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={`mobile-date-btn ${
                        showCalendar ? "active" : ""
                      }`}
                    >
                      <span>Starting</span>
                      <span className="mobile-date-value">
                        {formatDisplayDate(intervalStartDate)}
                      </span>
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

                    {/* Calendar */}
                    <AnimatePresence>
                      {showCalendar && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mobile-calendar-wrapper"
                        >
                          <DayPicker
                            mode="single"
                            selected={parseLocalDate(intervalStartDate)}
                            onSelect={handleDateSelect}
                            disabled={{ before: new Date() }}
                            weekStartsOn={1}
                            showOutsideDays={false}
                          />
                          <div className="mobile-calendar-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setIntervalStartDate(
                                  new Date().toISOString().split("T")[0]
                                );
                                setShowCalendar(false);
                              }}
                              className="mobile-calendar-btn"
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCalendar(false)}
                              className="mobile-calendar-btn primary"
                            >
                              Done
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mobile-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="mobile-btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="mobile-btn-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save" : "Create"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
