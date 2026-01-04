import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GoalCard } from '../components/GoalCard';
import { GoalModal } from '../components/GoalModal';
import { useGoalStore } from '../stores/goalStore';
import { DAY_NAMES_FULL, type GoalWithStatus } from '../types';

/**
 * Dashboard (Today View)
 * 
 * The main screen showing:
 * - Today's date
 * - Goals scheduled for today
 * - Completion progress
 * - Add goal button
 */
export function Dashboard() {
  const { goals, isLoading, error, fetchGoals } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithStatus | null>(null);

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals(true); // true = today only
  }, [fetchGoals]);

  // Calculate completion stats
  const completedCount = goals.filter(g => g.isCompletedToday).length;
  const totalCount = goals.length;
  const completionPercent = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  // Format today's date
  const today = new Date();
  const dayName = DAY_NAMES_FULL[today.getDay()];
  const dateStr = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
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
  };

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-1">{dayName}</h1>
        <p className="text-white/50 text-lg">{dateStr}</p>
      </div>

      {/* Progress card */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm mb-1">Today's Progress</p>
            <p className="text-2xl font-bold">
              <span className="font-mono">{completedCount}</span>
              <span className="text-white/30 mx-1">/</span>
              <span className="font-mono">{totalCount}</span>
              <span className="text-white/50 text-base ml-2">completed</span>
            </p>
          </div>
          
          {/* Circular progress */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgb(var(--color-primary))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${completionPercent * 1.76} 176`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono font-bold">
              {completionPercent}%
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200">
          {error}
        </div>
      )}

      {/* Goals list */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white/70">Today's Goals</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary text-sm py-2 px-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4v16m8-8H4" />
            </svg>
            Add Goal
          </button>
        </div>

        {isLoading && goals.length === 0 ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-solid rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
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
          // Empty state
          <GlassCard className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">No goals for today</h3>
            <p className="text-white/50 mb-4">
              Create your first goal to start tracking your progress
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              Create Goal
            </button>
          </GlassCard>
        ) : (
          // Goals list
          <div>
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={handleEdit}
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
    </div>
  );
}
