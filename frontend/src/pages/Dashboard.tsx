import { useEffect, useState } from 'react';
import { GoalCard } from '../components/GoalCard';
import { GoalModal } from '../components/GoalModal';
import { useGoalStore } from '../stores/goalStore';
import { DAY_NAMES_FULL, type GoalWithStatus } from '../types';
import { goalsApi } from '../api/goals';

/**
 * Dashboard (Today View) - Glass Design with Drag & Drop
 * 
 * Features:
 * - Transparent header (no colored bar)
 * - Glass progress card
 * - Glass goal cards with drag-drop reorder
 * - Glowing add button
 * - Two empty states: no goals ever vs no goals today
 */
export function Dashboard() {
  const { goals, isLoading, error, fetchGoals, reorderGoals } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithStatus | null>(null);
  const [draggedGoal, setDraggedGoal] = useState<GoalWithStatus | null>(null);
  const [dragOverGoalId, setDragOverGoalId] = useState<string | null>(null);
  const [hasAnyGoals, setHasAnyGoals] = useState<boolean | null>(null);

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals(true); // true = today only
    
    // Also check if user has any goals at all
    goalsApi.getAll(false).then(allGoals => {
      setHasAnyGoals(allGoals.length > 0);
    }).catch(() => {
      setHasAnyGoals(false);
    });
  }, [fetchGoals]);

  // Calculate completion stats
  const completedCount = goals.filter(g => g.isCompletedToday).length;
  const totalCount = goals.length;
  const completionPercent = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  // Format today's date with year
  const today = new Date();
  const dayName = DAY_NAMES_FULL[today.getDay()];
  const dateStr = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  // Handle edit goal
  const handleEdit = (goal: GoalWithStatus) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    // Refresh hasAnyGoals after modal closes (in case a goal was created)
    goalsApi.getAll(false).then(allGoals => {
      setHasAnyGoals(allGoals.length > 0);
    }).catch(() => {});
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, goal: GoalWithStatus) => {
    setDraggedGoal(goal);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedGoal(null);
    setDragOverGoalId(null);
  };

  const handleDragOver = (e: React.DragEvent, goal: GoalWithStatus) => {
    e.preventDefault();
    if (draggedGoal && draggedGoal.id !== goal.id) {
      setDragOverGoalId(goal.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverGoalId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetGoal: GoalWithStatus) => {
    e.preventDefault();
    if (!draggedGoal || draggedGoal.id === targetGoal.id) return;

    const draggedIndex = goals.findIndex(g => g.id === draggedGoal.id);
    const targetIndex = goals.findIndex(g => g.id === targetGoal.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...goals];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedGoal);

    // Get all goal IDs in new order
    const orderedIds = newOrder.map(g => g.id);
    await reorderGoals(orderedIds);

    setDraggedGoal(null);
    setDragOverGoalId(null);
  };

  // Render empty state based on whether user has any goals
  const renderEmptyState = () => {
    if (hasAnyGoals === false) {
      // No goals at all - show full empty state with branding
      return (
        <div className="empty-state">
          <h3 className="empty-state-title">No goals yet</h3>
          <p className="empty-state-text">
            Create your first goal to start tracking your progress
          </p>
          <div className="empty-state-icon-text">
            <span>HP</span><span className="dot">.</span>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-glow">
            Create Goal
          </button>
        </div>
      );
    } else {
      // Has goals but none scheduled for today - minimal message
      return (
        <div className="empty-state-minimal">
          <p className="empty-state-minimal-text">No goals scheduled for today</p>
        </div>
      );
    }
  };

  return (
    <>
      {/* Page Header - Transparent */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{dayName}</h1>
          <p className="page-subtitle">{dateStr}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-glow">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 4v16m8-8H4" />
          </svg>
          Add Goal
        </button>
      </div>

      {/* Progress Card */}
      <div className="progress-card">
        <div className="progress-stats">
          <div>
            <p className="progress-text-small">Today's Progress</p>
            <p className="progress-text-large">
              <span>{completedCount}</span>
              <span className="separator">/</span>
              <span>{totalCount}</span>
              <span className="label">completed</span>
            </p>
          </div>
          
          {/* Circular progress */}
          <div className="circular-progress">
            <svg viewBox="0 0 72 72">
              <circle className="bg" cx="36" cy="36" r="30" />
              <circle 
                className="fill" 
                cx="36" 
                cy="36" 
                r="30"
                strokeDasharray={`${completionPercent * 1.885} 188.5`}
              />
            </svg>
            <span className="percent">{completionPercent}%</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200">
          {error}
        </div>
      )}

      {/* Goals Section */}
      <div>
        <h2 className="section-header">Today's Goals</h2>

        {isLoading && goals.length === 0 ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="goal-card animate-pulse">
                <div className="goal-card-inner">
                  <div className="w-6 h-6 rounded-lg bg-white/10" />
                  <div className="flex-1">
                    <div className="h-5 w-32 bg-white/10 rounded mb-2" />
                    <div className="h-3 w-20 bg-white/5 rounded" />
                  </div>
                  <div className="h-8 w-12 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          renderEmptyState()
        ) : (
          // Goals list with drag and drop
          <div>
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={handleEdit}
                isDragOver={dragOverGoalId === goal.id}
                onDragStart={(e) => handleDragStart(e, goal)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, goal)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, goal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goal modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        goal={editingGoal}
      />
    </>
  );
}
