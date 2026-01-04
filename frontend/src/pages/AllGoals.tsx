import { useEffect, useState } from 'react';
import { GoalModal } from '../components/GoalModal';
import { useGoalStore } from '../stores/goalStore';
import { DAY_NAMES_SHORT, type GoalWithStatus } from '../types';

/**
 * AllGoals Page - Glass Design with Drag & Drop Reorder
 * 
 * Features:
 * - Transparent header with Add Goal button
 * - Glass goal cards with hover effects
 * - Drag and drop to reorder priorities
 * - Shows target value+unit or "Simple" badge
 */
export function AllGoals() {
  const { goals, isLoading, fetchGoals, deleteGoal, updateGoal, reorderGoals } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithStatus | null>(null);
  const [draggedGoal, setDraggedGoal] = useState<GoalWithStatus | null>(null);
  const [dragOverGoalId, setDragOverGoalId] = useState<string | null>(null);

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
    return days.map(d => DAY_NAMES_SHORT[d]).join(', ');
  };

  // Format target display
  const formatTarget = (goal: GoalWithStatus) => {
    if (!goal.isMeasurable) {
      return 'Simple';
    }
    const unitLabels: Record<string, string> = {
      minutes: 'min',
      pages: 'pg',
      reps: 'reps',
      liters: 'L',
      km: 'km',
      items: 'items',
    };
    return `${goal.targetValue}${unitLabels[goal.unit] || goal.unit}`;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, goal: GoalWithStatus) => {
    setDraggedGoal(goal);
    e.dataTransfer.effectAllowed = 'move';
    // Add a slight delay to show the drag visual
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
    if (draggedGoal && draggedGoal.id !== goal.id && draggedGoal.isActive === goal.isActive) {
      setDragOverGoalId(goal.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverGoalId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetGoal: GoalWithStatus) => {
    e.preventDefault();
    if (!draggedGoal || draggedGoal.id === targetGoal.id) return;
    if (draggedGoal.isActive !== targetGoal.isActive) return;

    // Get the list of goals (active or inactive)
    const goalList = draggedGoal.isActive ? activeGoals : inactiveGoals;
    const draggedIndex = goalList.findIndex(g => g.id === draggedGoal.id);
    const targetIndex = goalList.findIndex(g => g.id === targetGoal.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Create new order
    const newOrder = [...goalList];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedGoal);

    // Get all goal IDs in new order
    const orderedIds = newOrder.map(g => g.id);
    await reorderGoals(orderedIds);

    setDraggedGoal(null);
    setDragOverGoalId(null);
  };

  // Separate active and inactive goals (already sorted by sortOrder from backend)
  const activeGoals = goals.filter(g => g.isActive);
  const inactiveGoals = goals.filter(g => !g.isActive);

  return (
    <>
      {/* Page Header - Same as Dashboard */}
      <div className="page-header">
        <div>
          <h1 className="page-title">All Goals</h1>
          <p className="page-subtitle">Drag to reorder priorities</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-glow">
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
            <div key={i} className="goal-card animate-pulse">
              <div className="h-6 w-40 bg-white/10 rounded mb-2" />
              <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        // Empty state
        <div className="empty-state">
          <div className="empty-state-icon-text">
            <span>HP</span><span className="dot">.</span>
          </div>
          <h3 className="empty-state-title">No goals yet</h3>
          <p className="empty-state-text">
            Create goals to track your daily habits
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-glow">
            Create Your First Goal
          </button>
        </div>
      ) : (
        <>
          {/* Active goals */}
          {activeGoals.length > 0 && (
            <div className="mb-8">
              <h2 className="section-header">Active ({activeGoals.length})</h2>
              <div>
                {activeGoals.map((goal, index) => (
                  <div 
                    key={goal.id} 
                    className={`goal-card draggable ${dragOverGoalId === goal.id ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, goal)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, goal)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, goal)}
                  >
                    <div className="goal-card-inner">
                      {/* Drag handle */}
                      <div className="drag-handle" title="Drag to reorder">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      {/* Priority number */}
                      <div className="priority-badge">{index + 1}</div>

                      {/* Goal info */}
                      <div className="goal-info">
                        <h3 className="goal-name">{goal.name}</h3>
                        <div className="goal-schedule">
                          <span className="font-mono">{formatTarget(goal)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatSchedule(goal.scheduleDays)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="goal-actions">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="goal-action-btn"
                          aria-label="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleActive(goal)}
                          className="goal-action-btn"
                          aria-label="Deactivate"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(goal)}
                          className="goal-action-btn danger"
                          aria-label="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive goals */}
          {inactiveGoals.length > 0 && (
            <div>
              <h2 className="section-header">Inactive ({inactiveGoals.length})</h2>
              <div style={{ opacity: 0.6 }}>
                {inactiveGoals.map((goal) => (
                  <div key={goal.id} className="goal-card">
                    <div className="goal-card-inner">
                      {/* Goal info */}
                      <div className="goal-info">
                        <h3 className="goal-name" style={{ textDecoration: 'line-through' }}>
                          {goal.name}
                        </h3>
                        <div className="goal-schedule">
                          <span className="font-mono">{formatTarget(goal)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatSchedule(goal.scheduleDays)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="goal-actions">
                        <button
                          onClick={() => handleToggleActive(goal)}
                          className="goal-action-btn"
                          style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                          aria-label="Reactivate"
                        >
                          <svg className="w-4 h-4" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(goal)}
                          className="goal-action-btn danger"
                          aria-label="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
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
    </>
  );
}
