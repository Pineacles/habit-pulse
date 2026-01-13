import { useState } from "react";
import { addDays, startOfDay, differenceInDays, format } from "date-fns";
import { DAY_NAMES_SHORT, type GoalWithStatus } from "../types";
import { useGoalStore } from "../stores/goalStore";
import { DescriptionModal } from "./DescriptionModal";

interface GoalCardProps {
  goal: GoalWithStatus;
  // Drag and drop props
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

/**
 * GoalCard - Glass Bento Design with Drag & Drop
 *
 * Features:
 * - Glass card with hover lift effect
 * - Tap to toggle complete
 * - Glowing checkbox when checked
 * - Drag and drop to reorder (desktop)
 * - Shows unit or checkmark for simple goals
 */
export function GoalCard({
  goal,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: GoalCardProps) {
  const { toggleGoal } = useGoalStore();

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  // Description modal state
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // Handle tap - card click toggles completion
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't handle if clicking on drag handle, checkbox, or description button
    if (
      (e.target as HTMLElement).closest(".drag-handle") ||
      (e.target as HTMLElement).closest(".goal-checkbox") ||
      (e.target as HTMLElement).closest(".goal-description-btn")
    )
      return;

    // Toggle completion
    toggleGoal(goal.id);
  };

  // Handle checkbox click - toggle completion
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGoal(goal.id);
  };

  // Calculate next occurrence date for interval schedules
  const getNextOccurrence = (
    intervalDays: number,
    intervalStartDate: string
  ): Date | null => {
    try {
      // Parse the start date (ISO format "2025-01-13" from backend)
      const [year, month, day] = intervalStartDate.split("-").map(Number);
      const startDate = new Date(year, month - 1, day);

      const today = startOfDay(new Date());
      const start = startOfDay(startDate);

      // If start is in the future, that's the next occurrence
      if (start >= today) {
        return start;
      }

      // Calculate how many intervals have passed
      const daysSinceStart = differenceInDays(today, start);
      const cyclesPassed = Math.floor(daysSinceStart / intervalDays);

      // Calculate the next occurrence
      let nextOccurrence = addDays(start, cyclesPassed * intervalDays);

      // If we landed on today or before, add one more interval
      if (nextOccurrence < today) {
        nextOccurrence = addDays(nextOccurrence, intervalDays);
      }

      return nextOccurrence;
    } catch (e) {
      console.error("Error calculating next occurrence:", e);
      return null;
    }
  };

  // Format schedule days
  const formatSchedule = () => {
    // Check for interval schedule first
    if (goal.intervalDays && goal.intervalStartDate) {
      const nextOccurrence = getNextOccurrence(
        goal.intervalDays,
        goal.intervalStartDate
      );
      if (nextOccurrence) {
        const formattedDate = format(nextOccurrence, "MMM d");
        const today = startOfDay(new Date());
        const isToday =
          startOfDay(nextOccurrence).getTime() === today.getTime();
        return `Every ${goal.intervalDays} days${
          isToday ? " (Today)" : ` (Next: ${formattedDate})`
        }`;
      }
      return `Every ${goal.intervalDays} days`;
    }

    if (goal.scheduleDays.length === 7) return "Every day";
    if (
      goal.scheduleDays.length === 5 &&
      !goal.scheduleDays.includes(0) &&
      !goal.scheduleDays.includes(6)
    ) {
      return "Weekdays";
    }
    if (
      goal.scheduleDays.length === 2 &&
      goal.scheduleDays.includes(0) &&
      goal.scheduleDays.includes(6)
    ) {
      return "Weekends";
    }
    return goal.scheduleDays.map((d) => DAY_NAMES_SHORT[d]).join(", ");
  };

  // Format target display
  const formatTarget = () => {
    if (!goal.isMeasurable) {
      return null; // Simple goal - no target display
    }

    const unitLabels: Record<string, string> = {
      minutes: "min",
      pages: "pg",
      reps: "reps",
      liters: "L",
      km: "km",
      items: "items",
    };

    return `${goal.targetValue}${unitLabels[goal.unit] || goal.unit}`;
  };

  const isDraggable = !!onDragStart;
  const targetDisplay = formatTarget();

  return (
    <div className="relative rounded-2xl mb-3">
      {/* Main card */}
      <div
        className={`goal-card ${goal.isCompletedToday ? "completed" : ""} ${
          isDraggable ? "draggable" : ""
        } ${isDragOver ? "drag-over" : ""} ${isDragging ? "dragging" : ""}`}
        onClick={handleCardClick}
        draggable={isDraggable}
        onDragStart={(e) => {
          setIsDragging(true);
          onDragStart?.(e);
        }}
        onDragEnd={(e) => {
          setIsDragging(false);
          onDragEnd?.(e);
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="goal-card-inner">
          {/* Drag handle (desktop only) */}
          {isDraggable && (
            <div className="drag-handle hidden lg:flex" title="Drag to reorder">
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
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>
          )}

          {/* Checkbox */}
          <div
            className={`goal-checkbox ${
              goal.isCompletedToday ? "checked" : ""
            }`}
            onClick={handleCheckboxClick}
          >
            {goal.isCompletedToday && (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>

          {/* Goal info */}
          <div className="goal-info">
            <h3
              className={`goal-name ${
                goal.isCompletedToday ? "completed" : ""
              }`}
            >
              {goal.name}
            </h3>
            <p className="goal-schedule">{formatSchedule()}</p>
          </div>

          {/* Target display - only show for measurable goals */}
          {targetDisplay && (
            <div className="goal-target">
              <span className="goal-target-value">{goal.targetValue}</span>
              <span className="goal-target-unit">
                {goal.unit === "minutes" ? "min" : goal.unit}
              </span>
            </div>
          )}

          {/* Info button - opens description modal */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDescriptionModal(true);
            }}
            className="goal-description-btn"
            aria-label={
              goal.description ? "View description" : "View goal details"
            }
            title={goal.description ? "View description" : "View goal details"}
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Description Modal */}
      <DescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        goal={goal}
      />
    </div>
  );
}
