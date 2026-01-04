import { useState, useRef } from 'react';
import type { GoalWithStatus } from '../types';
import { DAY_NAMES } from '../types';
import { useGoalStore } from '../stores/goalStore';

interface GoalCardProps {
  goal: GoalWithStatus;
  onEdit: (goal: GoalWithStatus) => void;
}

/**
 * GoalCard
 * 
 * Displays a single goal with:
 * - Card fill effect showing completion status
 * - Tap to toggle complete
 * - Swipe left to reveal edit/delete actions
 * - Target minutes display in monospace font
 */
export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const { toggleGoal, deleteGoal } = useGoalStore();
  
  // Swipe state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle tap to toggle
  const handleTap = () => {
    if (isRevealed) {
      // Close swipe menu on tap
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
    // Only allow left swipe (positive diff), max 120px
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 120));
    } else if (isRevealed) {
      // Allow closing by swiping right
      setSwipeOffset(Math.max(120 + diff, 0));
    }
  };

  const handleTouchEnd = () => {
    // Snap to revealed or closed
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
    if (confirm('Are you sure you want to delete this goal?')) {
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

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl mb-3"
    >
      {/* Swipe actions (revealed on swipe left) */}
      <div 
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 px-3"
        style={{ transform: `translateX(${120 - swipeOffset}px)` }}
      >
        <button
          onClick={() => onEdit(goal)}
          className="w-12 h-12 rounded-xl bg-blue-500/80 flex items-center justify-center
                     hover:bg-blue-500 transition-colors"
          aria-label="Edit goal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="w-12 h-12 rounded-xl bg-red-500/80 flex items-center justify-center
                     hover:bg-red-500 transition-colors"
          aria-label="Delete goal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Main card content */}
      <div
        className={`
          glass-solid relative overflow-hidden cursor-pointer
          transition-all duration-200 active:scale-[0.98]
          ${goal.isCompletedToday ? 'border-white/30' : ''}
        `}
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress fill (card background fills when complete) */}
        <div 
          className="card-progress"
          style={{ height: goal.isCompletedToday ? '100%' : '0%' }}
        />

        {/* Card content */}
        <div className="relative z-10 p-4 flex items-center gap-4">
          {/* Checkbox */}
          <div className={`checkbox ${goal.isCompletedToday ? 'checked' : ''}`}>
            {goal.isCompletedToday && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} 
                      d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Goal info */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-lg truncate
                          ${goal.isCompletedToday ? 'line-through opacity-60' : ''}`}>
              {goal.name}
            </h3>
            <p className="text-sm text-white/50 mt-0.5">
              {formatSchedule()}
            </p>
          </div>

          {/* Target minutes */}
          <div className="text-right">
            <span className="font-mono text-2xl font-bold text-white/90">
              {goal.targetMinutes}
            </span>
            <span className="text-xs text-white/40 ml-1">min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
