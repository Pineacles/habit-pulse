import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoalModal } from '../components/GoalModal';
import { DescriptionModal } from '../components/DescriptionModal';
import { useGoalStore } from '../stores/goalStore';
import { type GoalWithStatus } from '../types';
import { formatSchedule, formatTargetWithLabel } from '../utils/goalHelpers';

/**
 * AllGoals - View and manage all goals with drag-drop priority reordering.
 * Separates active and inactive goals.
 */
export function AllGoals() {
  const { goals, isLoading, fetchGoals, deleteGoal, updateGoal, reorderGoals } = useGoalStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithStatus | null>(null);
  const [draggedGoal, setDraggedGoal] = useState<GoalWithStatus | null>(null);
  const [dragOverGoalId, setDragOverGoalId] = useState<string | null>(null);
  const [descriptionModalGoal, setDescriptionModalGoal] = useState<GoalWithStatus | null>(null);
  const [openKebabMenuId, setOpenKebabMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals(false);
  }, [fetchGoals]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openKebabMenuId && !(e.target as HTMLElement).closest('.kebab-menu-container')) {
        setOpenKebabMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openKebabMenuId]);

  const handleEdit = (goal: GoalWithStatus) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = async (goal: GoalWithStatus) => {
    if (confirm(`Delete "${goal.name}"? This cannot be undone.`)) {
      await deleteGoal(goal.id);
    }
  };

  const handleToggleActive = async (goal: GoalWithStatus) => {
    await updateGoal(goal.id, { isActive: !goal.isActive });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

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

    const goalList = draggedGoal.isActive ? activeGoals : inactiveGoals;
    const draggedIndex = goalList.findIndex(g => g.id === draggedGoal.id);
    const targetIndex = goalList.findIndex(g => g.id === targetGoal.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...goalList];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedGoal);

    const orderedIds = newOrder.map(g => g.id);
    await reorderGoals(orderedIds);

    setDraggedGoal(null);
    setDragOverGoalId(null);
  };

  const activeGoals = goals.filter(g => g.isActive);
  const inactiveGoals = goals.filter(g => !g.isActive);

  return (
    <>
      {/* Page Header - Same as Dashboard */}
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">Drag to reorder priorities</p>
        </div>
        {/* Desktop: New Habit button */}
        <div className="page-header-desktop">
          <button onClick={() => setIsModalOpen(true)} className="btn-glow">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4v16m8-8H4" />
            </svg>
            New Habit
          </button>
        </div>
      </motion.div>

      {/* Mobile: Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`fab-add-goal ${isModalOpen ? "fab-hidden" : ""}`}
        aria-label="New Habit"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <div className="allgoals-page">
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
          <h3 className="empty-state-title">No habits yet</h3>
          <p className="empty-state-text">
            Create habits to track your daily progress
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn-glow">
            Create Your First Habit
          </button>
        </div>
      ) : (
        <>
          {/* Active goals */}
          {activeGoals.length > 0 && (
            <div className="mb-8">
              <h2 className="section-header">Active ({activeGoals.length})</h2>
              <motion.div layout>
                {activeGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      opacity: { duration: 0.3, ease: [0.2, 0, 0, 1] },
                      y: { duration: 0.3, ease: [0.2, 0, 0, 1] },
                      layout: {
                        duration: 0.25,
                        ease: [0.2, 0, 0, 1],
                      },
                      delay: index * 0.05,
                    }}
                  >
                    <div
                      className={`goal-card draggable ${dragOverGoalId === goal.id ? 'drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, goal)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, goal)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, goal)}
                      onClick={(e) => {
                        // Make card clickable for description - don't trigger if clicking buttons
                        if (
                          (e.target as HTMLElement).closest('.goal-action-btn') ||
                          (e.target as HTMLElement).closest('.kebab-menu-container') ||
                          (e.target as HTMLElement).closest('.drag-handle')
                        ) return;
                        if (goal.description) {
                          setDescriptionModalGoal(goal);
                        }
                      }}
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

                      {/* Goal info - 60-70% width */}
                      <div className="goal-info goal-info-allgoals">
                        <h3 className="goal-name">{goal.name}</h3>
                        <div className="goal-schedule">
                          <span className="font-mono">{formatTargetWithLabel(goal)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatSchedule(goal)}</span>
                        </div>
                      </div>

                      {/* Actions - Mobile: Edit + Kebab, Desktop: All buttons */}
                      <div className="goal-actions">
                        {/* Edit button - always visible */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(goal);
                          }}
                          className="goal-action-btn goal-action-btn-primary"
                          aria-label="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Desktop: Show all buttons */}
                        <div className="goal-actions-desktop">
                          {goal.description && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDescriptionModalGoal(goal);
                              }}
                              className="goal-action-btn"
                              aria-label="View description"
                              title="View description"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(goal);
                            }}
                            className="goal-action-btn"
                            aria-label="Deactivate"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(goal);
                            }}
                            className="goal-action-btn danger"
                            aria-label="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Mobile: Kebab menu for secondary actions */}
                        <div className="kebab-menu-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenKebabMenuId(openKebabMenuId === goal.id ? null : goal.id);
                            }}
                            className="kebab-menu-btn"
                            aria-label="More options"
                            aria-expanded={openKebabMenuId === goal.id}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          <AnimatePresence>
                            {openKebabMenuId === goal.id && (
                              <>
                                {/* Backdrop for mobile */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="kebab-menu-backdrop"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenKebabMenuId(null);
                                  }}
                                />
                                <motion.div
                                  initial={{ y: '100%', opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: '100%', opacity: 0 }}
                                  transition={{ 
                                    type: 'spring', 
                                    damping: 35, 
                                    stiffness: 400,
                                    mass: 0.8
                                  }}
                                  className="kebab-menu-dropdown"
                                  onClick={(e) => e.stopPropagation()}
                                >
                              {goal.description && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDescriptionModalGoal(goal);
                                    setOpenKebabMenuId(null);
                                  }}
                                  className="kebab-menu-item"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>View Description</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleActive(goal);
                                  setOpenKebabMenuId(null);
                                }}
                                className="kebab-menu-item"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <span>Deactivate</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(goal);
                                  setOpenKebabMenuId(null);
                                }}
                                className="kebab-menu-item kebab-menu-item-danger"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                              </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Inactive goals */}
          {inactiveGoals.length > 0 && (
            <div>
              <h2 className="section-header">Inactive ({inactiveGoals.length})</h2>
              <div style={{ opacity: 0.6 }}>
                {inactiveGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      opacity: { duration: 0.3, ease: [0.2, 0, 0, 1] },
                      y: { duration: 0.3, ease: [0.2, 0, 0, 1] },
                      delay: index * 0.05,
                    }}
                  >
                  <div 
                    className="goal-card"
                    onClick={(e) => {
                      // Make card clickable for description
                      if (
                        (e.target as HTMLElement).closest('.goal-action-btn') ||
                        (e.target as HTMLElement).closest('.kebab-menu-container')
                      ) return;
                      if (goal.description) {
                        setDescriptionModalGoal(goal);
                      }
                    }}
                  >
                    <div className="goal-card-inner">
                      {/* Goal info - 60-70% width */}
                      <div className="goal-info goal-info-allgoals">
                        <h3 className="goal-name" style={{ textDecoration: 'line-through' }}>
                          {goal.name}
                        </h3>
                        <div className="goal-schedule">
                          <span className="font-mono">{formatTargetWithLabel(goal)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatSchedule(goal)}</span>
                        </div>
                      </div>

                      {/* Actions - Mobile: Reactivate + Kebab, Desktop: All buttons */}
                      <div className="goal-actions">
                        {/* Reactivate button - always visible */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(goal);
                          }}
                          className="goal-action-btn goal-action-btn-primary"
                          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                          aria-label="Reactivate"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        {/* Desktop: Show all buttons */}
                        <div className="goal-actions-desktop">
                          {goal.description && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDescriptionModalGoal(goal);
                              }}
                              className="goal-action-btn"
                              aria-label="View description"
                              title="View description"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(goal);
                            }}
                            className="goal-action-btn danger"
                            aria-label="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Mobile: Kebab menu for secondary actions */}
                        <div className="kebab-menu-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenKebabMenuId(openKebabMenuId === goal.id ? null : goal.id);
                            }}
                            className="kebab-menu-btn"
                            aria-label="More options"
                            aria-expanded={openKebabMenuId === goal.id}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          <AnimatePresence>
                            {openKebabMenuId === goal.id && (
                              <>
                                {/* Backdrop for mobile */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="kebab-menu-backdrop"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenKebabMenuId(null);
                                  }}
                                />
                                <motion.div
                                  initial={{ y: '100%', opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: '100%', opacity: 0 }}
                                  transition={{ 
                                    type: 'spring', 
                                    damping: 35, 
                                    stiffness: 400,
                                    mass: 0.8
                                  }}
                                  className="kebab-menu-dropdown"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {goal.description && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDescriptionModalGoal(goal);
                                        setOpenKebabMenuId(null);
                                      }}
                                      className="kebab-menu-item"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>View Description</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(goal);
                                      setOpenKebabMenuId(null);
                                    }}
                                    className="kebab-menu-item kebab-menu-item-danger"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {/* Goal modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        goal={editingGoal}
      />

      {/* Description modal */}
      <DescriptionModal
        isOpen={!!descriptionModalGoal}
        onClose={() => setDescriptionModalGoal(null)}
        goal={descriptionModalGoal}
      />
    </>
  );
}
