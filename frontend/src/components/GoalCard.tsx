import { useState, useRef } from 'react';
import { DAY_NAMES, type GoalWithStatus } from '../types';
import { useGoalStore } from '../stores/goalStore';

interface GoalCardProps {
  goal: GoalWithStatus;
  onEdit: (goal: GoalWithStatus) => void;
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
 * - Swipe left to reveal edit/delete (mobile)
 * - Glowing checkbox when checked
 * - Drag and drop to reorder
 */
export function GoalCard({ 
  goal, 
  onEdit,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop
}: GoalCardProps) {
  const { toggleGoal, deleteGoal } = useGoalStore();
  
  // Swipe state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const touchStartX = useRef(0);

  // Handle tap to toggle
  const handleTap = (e: React.MouseEvent) => {
    // Don't toggle if clicking on drag handle
    if ((e.target as HTMLElement).closest('.drag-handle')) return;
    
    if (isRevealed) {
      setSwipeOffset(0);
      setIsRevealed(false);
      return;
    }
    toggleGoal(goal.id);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.touches[0].clientX;
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 120));
    } else if (isRevealed) {
      setSwipeOffset(Math.max(120 + diff, 0));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      setSwipeOffset(120);
      setIsRevealed(true);
    } else {
      setSwipeOffset(0);
      setIsRevealed(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (confirm('Delete this goal?')) {
      await deleteGoal(goal.id);
    }
  };

  // Format schedule days
  const formatSchedule = () => {
    if (goal.scheduleDays.length === 7) return 'Every day';
    if (goal.scheduleDays.length === 5 && 
        !goal.scheduleDays.includes(0) && 
        !goal.scheduleDays.includes(6)) {
      return 'Weekdays';
    }
    if (goal.scheduleDays.length === 2 && 
        goal.scheduleDays.includes(0) && 
        goal.scheduleDays.includes(6)) {
      return 'Weekends';
    }
    return goal.scheduleDays.map(d => DAY_NAMES[d]).join(', ');
  };

  const isDraggable = !!onDragStart;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* Swipe actions (mobile) */}
      <div 
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 px-3"
        style={{ transform: `translateX(${120 - swipeOffset}px)` }}
      >
        <button
          onClick={() => onEdit(goal)}
          className="w-12 h-12 rounded-xl bg-blue-500/80 flex items-center justify-center"
          aria-label="Edit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="w-12 h-12 rounded-xl bg-red-500/80 flex items-center justify-center"
          aria-label="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Main card */}
      <div
        className={`goal-card ${goal.isCompletedToday ? 'completed' : ''} ${isDraggable ? 'draggable' : ''} ${isDragOver ? 'drag-over' : ''}`}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        draggable={isDraggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="goal-card-inner">
          {/* Drag handle (desktop only) */}
          {isDraggable && (
            <div className="drag-handle hidden lg:flex" title="Drag to reorder">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 8h16M4 16h16" />
              </svg>
            </div>
          )}

          {/* Checkbox */}
          <div className={`goal-checkbox ${goal.isCompletedToday ? 'checked' : ''}`}>
            {goal.isCompletedToday && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} 
                      d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Goal info */}
          <div className="goal-info">
            <h3 className={`goal-name ${goal.isCompletedToday ? 'completed' : ''}`}>
              {goal.name}
            </h3>
            <p className="goal-schedule">{formatSchedule()}</p>
          </div>

          {/* Target minutes */}
          <div className="goal-minutes">
            <span className="goal-minutes-value">{goal.targetMinutes}</span>
            <span className="goal-minutes-label">min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
