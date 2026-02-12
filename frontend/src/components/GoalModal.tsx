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
import { GoalModalMobile } from "./GoalModalMobile";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: GoalWithStatus | null;
}

type FrequencyType = "daily" | "weekdays" | "weekends" | "custom";
type CustomMode = "specific-days" | "interval";

const spring = { type: "spring", stiffness: 400, damping: 30 };

export function GoalModal({ isOpen, onClose, goal }: GoalModalProps) {
  // All hooks must be called before any conditional returns (React Rules of Hooks)
  const { createGoal, updateGoal } = useGoalStore();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640;
    }
    return false;
  });

  const [name, setName] = useState("");
  const [isMeasurable, setIsMeasurable] = useState(false);
  const [targetValue, setTargetValue] = useState(30);
  const [unit, setUnit] = useState("minutes");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [scheduleDays, setScheduleDays] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);

  const [customMode, setCustomMode] = useState<CustomMode>("specific-days");
  const [intervalDays, setIntervalDays] = useState(2);
  const [intervalStartDate, setIntervalStartDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [description, setDescription] = useState<string>("");

  const [activeEdit, setActiveEdit] = useState<
    "target" | "interval" | "description" |     null
  >(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Responsive: listen for window resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setIsMeasurable(goal.isMeasurable);
      setTargetValue(goal.targetValue || 30);
      setUnit(goal.unit || "minutes");
      setScheduleDays([...goal.scheduleDays]);
      setDescription(goal.description || "");

      if (goal.intervalDays && goal.intervalStartDate) {
        setFrequencyType("custom");
        setCustomMode("interval");
        setIntervalDays(goal.intervalDays);
        setIntervalStartDate(goal.intervalStartDate);
        setActiveEdit("interval");
      } else {
        setCustomMode("specific-days");
        setActiveEdit(goal.isMeasurable ? "target" : null);
        if (goal.scheduleDays.length === 7) {
          setFrequencyType("daily");
        } else if (
          goal.scheduleDays.length === 5 &&
          !goal.scheduleDays.includes(0) &&
          !goal.scheduleDays.includes(6)
        ) {
          setFrequencyType("weekdays");
        } else if (
          goal.scheduleDays.length === 2 &&
          goal.scheduleDays.includes(0) &&
          goal.scheduleDays.includes(6)
        ) {
          setFrequencyType("weekends");
        } else {
          setFrequencyType("custom");
        }
      }
    } else {
      setName("");
      setIsMeasurable(false);
      setTargetValue(30);
      setUnit("minutes");
      setFrequencyType("daily");
      setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
      setCustomMode("specific-days");
      setIntervalDays(2);
      setIntervalStartDate(new Date().toISOString().split("T")[0]);
      setDescription("");
      setActiveEdit(null);
    }
    setError("");
    setShowCalendar(false);
    setShowDescription(false);
  }, [goal, isOpen]);

  // Render mobile version on mobile devices
  if (isMobile) {
    return <GoalModalMobile isOpen={isOpen} onClose={onClose} goal={goal} />;
  }

  const isEditing = !!goal;
  const isIntervalMode =
    frequencyType === "custom" && customMode === "interval";

  const shouldShowCalendar =
    showCalendar && isIntervalMode && activeEdit === "interval";

  const handleMeasurableChange = (measurable: boolean) => {
    setIsMeasurable(measurable);
    if (measurable) {
      setActiveEdit("target");
      setShowCalendar(false); // Close calendar
      setShowDescription(false); // Close description
    } else {
      setActiveEdit(isIntervalMode ? "interval" : null);
    }
  };

  const handleFrequencyChange = (type: FrequencyType) => {
    setFrequencyType(type);
    setShowCalendar(false); // Close calendar on any frequency change
    setShowDescription(false); // Close description on any frequency change
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
        break;
    }
    if (type !== "custom" || customMode !== "interval") {
      if (isMeasurable) setActiveEdit("target");
    }
  };

  const handleCustomModeChange = (mode: CustomMode) => {
    setCustomMode(mode);
    setShowCalendar(false); // Close calendar when switching modes
    setShowDescription(false); // Close description when switching modes
    if (mode === "interval") {
      setActiveEdit("interval");
    } else {
      if (isMeasurable) setActiveEdit("target");
      else setActiveEdit(null);
    }
  };

  const toggleDay = (day: number) => {
    setFrequencyType("custom");
    setCustomMode("specific-days");
    setShowCalendar(false);
    if (isMeasurable) setActiveEdit("target");
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

  const openCalendar = () => {
    if (showCalendar && activeEdit === "interval") {
      setShowCalendar(false);
      if (isMeasurable) {
        setActiveEdit("target");
      } else {
        setActiveEdit(null);
      }
    } else {
      if (showDescription) {
        setShowDescription(false);
        setActiveEdit(null);
        setTimeout(() => {
          setActiveEdit("interval");
          setShowCalendar(true);
        }, 300);
      } else {
        setActiveEdit("interval");
        setShowCalendar(true);
      }
    }
  };

  const openDescription = () => {
    if (showDescription && activeEdit === "description") {
      setShowDescription(false);
      if (isMeasurable) {
        setActiveEdit("target");
      } else if (isIntervalMode) {
        setActiveEdit("interval");
      } else {
        setActiveEdit(null);
      }
    } else {
      if (showCalendar) {
        setShowCalendar(false);
        setActiveEdit(null);
        setTimeout(() => {
          setActiveEdit("description");
          setShowDescription(true);
        }, 300);
      } else {
        setActiveEdit("description");
        setShowDescription(true);
      }
    }
  };

  const setToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setIntervalStartDate(`${year}-${month}-${day}`);
    setShowCalendar(false);
  };

  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getUnitLabel = () => {
    const opt = UNIT_OPTIONS.find((o) => o.value === unit);
    return opt?.label || unit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a habit name");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const useInterval =
        frequencyType === "custom" && customMode === "interval";

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

  if (!isOpen) return null;

  if (isMobile) {
    return null;
  }

  const showTargetExpanded = isMeasurable && activeEdit === "target";
  const showTargetCollapsed =
    isMeasurable &&
    (activeEdit === "interval" ||
      activeEdit === "description" ||
      activeEdit === null);
  const showIntervalExpanded = isIntervalMode && activeEdit === "interval";
  const showIntervalCollapsed =
    isIntervalMode &&
    (activeEdit === "target" ||
      activeEdit === "description" ||
      activeEdit === null);

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
                {isEditing ? "Edit Habit" : "New Habit"}
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
              <label className="modal-label">Habit Name</label>
              <div className="goal-name-row">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Meditate, Read, Exercise"
                  autoFocus
                  className="modal-input"
                />
                {/* Desktop: Description button next to input */}
                <button
                  type="button"
                  onClick={openDescription}
                  className={`goal-name-description-btn desktop-only ${
                    showDescription && activeEdit === "description"
                      ? "active"
                      : ""
                  }`}
                  title={description ? "Edit description" : "Add description"}
                  aria-label={
                    description ? "Edit description" : "Add description"
                  }
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {description && (
                    <span
                      className="description-indicator"
                      title="Description added"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile: Expandable description field inline */}
              <div className="mobile-description-section">
                <button
                  type="button"
                  onClick={() => setShowDescription(!showDescription)}
                  className={`mobile-description-toggle ${
                    showDescription ? "expanded" : ""
                  } ${description ? "has-content" : ""}`}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>
                    {description ? "Edit description" : "Add description"}
                  </span>
                  {description && (
                    <svg
                      className="w-4 h-4 check-icon"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <svg
                    className={`w-4 h-4 chevron ${
                      showDescription ? "rotated" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <AnimatePresence>
                  {showDescription && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mobile-description-content"
                    >
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add notes or details about this habit..."
                        maxLength={500}
                        className="mobile-description-textarea"
                        rows={3}
                      />
                      <div className="mobile-description-footer">
                        <span className="char-count">
                          {description.length}/500
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="modal-section">
              <label className="modal-label">Habit Type</label>
              <div className="goal-type-toggle">
                <button
                  type="button"
                  className={`type-btn ${!isMeasurable ? "active" : ""}`}
                  onClick={() => handleMeasurableChange(false)}
                >
                  <svg
                    className="icon icon-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Simple</span>
                </button>
                <button
                  type="button"
                  className={`type-btn ${isMeasurable ? "active" : ""}`}
                  onClick={() => handleMeasurableChange(true)}
                >
                  <svg
                    className="icon icon-sm"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Measurable</span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {showTargetExpanded && (
                <motion.div
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={spring}
                  className="modal-section-animated"
                >
                  <div className="modal-section-inner">
                    <label className="modal-label">Target</label>
                    <div className="target-row">
                      <div className="digital-input-container">
                        <button
                          type="button"
                          className="digital-btn minus"
                          onClick={() => adjustValue(-5)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={targetValue}
                          onChange={(e) =>
                            setTargetValue(parseInt(e.target.value) || 0)
                          }
                          min={1}
                          max={999}
                          className="digital-input"
                        />
                        <button
                          type="button"
                          className="digital-btn plus"
                          onClick={() => adjustValue(5)}
                        >
                          +
                        </button>
                      </div>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="unit-select"
                      >
                        {UNIT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="value-presets">
                      {[15, 30, 45, 60].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTargetValue(val)}
                          className={`preset-chip ${
                            targetValue === val ? "active" : ""
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {showTargetCollapsed && (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="collapsed-row clickable"
                  onClick={() => setActiveEdit("target")}
                >
                  <span className="collapsed-label">Target</span>
                  <span className="collapsed-value">
                    {targetValue} {getUnitLabel()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="modal-section">
              <label className="modal-label">Schedule</label>

              <div className="frequency-chips">
                {(["daily", "weekdays", "weekends", "custom"] as const).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleFrequencyChange(type)}
                      className={`freq-chip ${
                        frequencyType === type ? "active" : ""
                      }`}
                    >
                      {type === "daily" && "Every Day"}
                      {type === "weekdays" && "Weekdays"}
                      {type === "weekends" && "Weekends"}
                      {type === "custom" && "Custom"}
                    </button>
                  )
                )}
              </div>

              {frequencyType === "custom" && (
                <div className="custom-schedule-section">
                  <div className="segmented-control">
                    <button
                      type="button"
                      onClick={() => handleCustomModeChange("specific-days")}
                      className={`segment-btn ${
                        customMode === "specific-days" ? "active" : ""
                      }`}
                    >
                      Specific Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCustomModeChange("interval")}
                      className={`segment-btn ${
                        customMode === "interval" ? "active" : ""
                      }`}
                    >
                      By Interval
                    </button>
                  </div>

                  {customMode === "specific-days" && (
                    <div className="schedule-grid">
                      {DAY_NAMES.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleDay(index)}
                          className={`day-pill ${
                            scheduleDays.includes(index) ? "active" : ""
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {customMode === "interval" && showIntervalExpanded && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={spring}
                        className="modal-section-animated"
                      >
                        <div className="interval-controls">
                          <div className="interval-row">
                            <span className="interval-text">Repeat every</span>
                            <div className="digital-input-container compact">
                              <button
                                type="button"
                                className="digital-btn minus"
                                onClick={() => adjustInterval(-1)}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={intervalDays}
                                onChange={(e) =>
                                  setIntervalDays(
                                    Math.max(
                                      1,
                                      Math.min(
                                        365,
                                        parseInt(e.target.value) || 1
                                      )
                                    )
                                  )
                                }
                                min={1}
                                max={365}
                                className="digital-input"
                              />
                              <button
                                type="button"
                                className="digital-btn plus"
                                onClick={() => adjustInterval(1)}
                              >
                                +
                              </button>
                            </div>
                            <span className="interval-text">days</span>
                          </div>

                          {/* Start Date Button - only opens calendar via icon */}
                          <button
                            type="button"
                            onClick={openCalendar}
                            className={`start-date-btn ${
                              shouldShowCalendar ? "active" : ""
                            }`}
                          >
                            <span className="start-date-label">Starting</span>
                            <span className="start-date-value">
                              {formatDisplayDate(intervalStartDate)}
                              {shouldShowCalendar && (
                                <span className="pulse-dot" />
                              )}
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="popLayout">
                    {customMode === "interval" && showIntervalCollapsed && (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="collapsed-row clickable"
                        onClick={() => setActiveEdit("interval")}
                      >
                        <span className="collapsed-label">Interval</span>
                        <span className="collapsed-value">
                          Every {intervalDays} days
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {(frequencyType === "weekdays" ||
                frequencyType === "weekends") && (
                <div className="schedule-grid">
                  {DAY_NAMES.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`day-pill ${
                        scheduleDays.includes(index) ? "active" : ""
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
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
                  : "Create Habit"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Calendar Drawer - Proper month grid */}
        <AnimatePresence mode="popLayout">
          {shouldShowCalendar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="calendar-drawer"
              data-open={shouldShowCalendar ? "true" : "false"}
            >
              <div className="calendar-drawer-inner">
                {/* Header */}
                <div className="calendar-drawer-header">
                  <span className="calendar-drawer-title">
                    Select start date
                  </span>
                </div>

                {/* Calendar */}
                <DayPicker
                  mode="single"
                  selected={parseLocalDate(intervalStartDate)}
                  onSelect={handleDateSelect}
                  disabled={{ before: new Date() }}
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
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {showDescription && activeEdit === "description" && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="calendar-drawer description-drawer"
              data-open={
                showDescription && activeEdit === "description"
                  ? "true"
                  : "false"
              }
            >
              <div className="calendar-drawer-inner">
                {/* Header */}
                <div className="calendar-drawer-header">
                  <span className="calendar-drawer-title">
                    {description ? "Edit description" : "Add description"}
                  </span>
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes or details about this habit..."
                  maxLength={500}
                  className="description-textarea"
                  rows={8}
                  autoFocus
                />

                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.4)",
                    textAlign: "right",
                  }}
                >
                  {description.length}/500
                </div>

                <div className="calendar-quick-actions">
                  <button
                    type="button"
                    onClick={() => setShowDescription(false)}
                    className="calendar-action-btn"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
