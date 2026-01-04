import { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GoalModal } from '../components/GoalModal';
import { useGoalStore } from '../stores/goalStore';
import { DAY_NAMES, type GoalWithStatus } from '../types';

/**
 * AllGoals Page
 * 
 * Shows all goals (not filtered by today's schedule).
 * Used for managing goals: create, edit, delete, activate/deactivate.
 */
export function AllGoals() {
  const { goals, isLoading, fetchGoals, deleteGoal, updateGoal } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithStatus | null>(null);

  // Fetch ALL goals (not just today's)
  useEffect(() => {
    fetchGoals(false);
  }, [fetchGoals]);

  // Handle edit
  const handleEdit = (goal: GoalWithStatus) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (goal: GoalWithStatus) => {
    if (confirm(`Delete "${goal.name}"? This cannot be undone.`)) {
      await deleteGoal(goal.id);
    }
  };

  // Toggle active status
  const handleToggleActive = async (goal: GoalWithStatus) => {
    await updateGoal(goal.id, { isActive: !goal.isActive });
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  // Format schedule
  const formatSchedule = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => DAY_NAMES[d]).join(', ');
  };

  // Separate active and inactive goals
  const activeGoals = goals.filter(g => g.isActive);
  const inactiveGoals = goals.filter(g => !g.isActive);

  return (
    <div className="p-4 lg:p-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-1">All Goals</h1>
          <p className="text-white/50">Manage your recurring goals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {isLoading && goals.length === 0 ? (
        // Loading
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-solid rounded-2xl p-4 animate-pulse">
              <div className="h-6 w-40 bg-white/10 rounded mb-2" />
              <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        // Empty state
        <GlassCard className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
          <p className="text-white/50 mb-4">
            Create goals to track your daily habits
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            Create Your First Goal
          </button>
        </GlassCard>
      ) : (
        <>
          {/* Active goals */}
          {activeGoals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                Active ({activeGoals.length})
              </h2>
              <div className="space-y-2">
                {activeGoals.map((goal) => (
                  <GlassCard key={goal.id} padding="none" className="overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      {/* Goal info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{goal.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                          <span className="font-mono">{goal.targetMinutes}min</span>
                          <span>•</span>
                          <span>{formatSchedule(goal.scheduleDays)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 
                                   flex items-center justify-center transition-colors"
                          aria-label="Edit"
                        >
                          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleActive(goal)}
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 
                                   flex items-center justify-center transition-colors"
                          aria-label="Deactivate"
                        >
                          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(goal)}
                          className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 
                                   flex items-center justify-center transition-colors"
                          aria-label="Delete"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Inactive goals */}
          {inactiveGoals.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
                Inactive ({inactiveGoals.length})
              </h2>
              <div className="space-y-2 opacity-60">
                {inactiveGoals.map((goal) => (
                  <GlassCard key={goal.id} padding="none" className="overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      {/* Goal info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate line-through">
                          {goal.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                          <span className="font-mono">{goal.targetMinutes}min</span>
                          <span>•</span>
                          <span>{formatSchedule(goal.scheduleDays)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(goal)}
                          className="w-10 h-10 rounded-xl bg-green-500/10 hover:bg-green-500/20 
                                   flex items-center justify-center transition-colors"
                          aria-label="Reactivate"
                        >
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(goal)}
                          className="w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500/20 
                                   flex items-center justify-center transition-colors"
                          aria-label="Delete"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Goal modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        goal={editingGoal}
      />
    </div>
  );
}
