import { useState } from "react";
import { type GoalWithStatus } from "../types";
import { useGoalStore } from "../stores/goalStore";
import { DescriptionModal } from "./DescriptionModal";
import {
  formatSchedule,
  formatTarget,
  UNIT_LABELS,
} from "../utils/goalHelpers";

interface GoalCardProps {
  goal: GoalWithStatus;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

/**
 * GoalCard - Individual goal item with completion toggle and drag-drop reordering.
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
  const [isDragging, setIsDragging] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(".drag-handle") ||
      (e.target as HTMLElement).closest(".goal-checkbox") ||
      (e.target as HTMLElement).closest(".goal-description-btn")
      )
      return;

    toggleGoal(goal.id);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleGoal(goal.id);
  };

  const isDraggable = !!onDragStart;
  const targetDisplay = formatTarget(goal);

  return (
    <div className="relative rounded-2xl mb-3">
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

          <div className="goal-info">
            <h3
              className={`goal-name ${
                goal.isCompletedToday ? "completed" : ""
              }`}
            >
              {goal.name}
            </h3>
            <p className="goal-schedule">{formatSchedule(goal)}</p>
          </div>

          {targetDisplay && (
            <div className="goal-target">
              <span className="goal-target-value">{goal.targetValue}</span>
              <span className="goal-target-unit">
                {UNIT_LABELS[goal.unit] || goal.unit}
              </span>
            </div>
          )}

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

      <DescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        goal={goal}
      />
    </div>
  );
}
