import { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { DAY_NAMES, type GoalWithStatus, type CreateGoalRequest, type UpdateGoalRequest } from '../types';
import { useGoalStore } from '../stores/goalStore';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: GoalWithStatus | null; // If provided, we're editing
}

/**
 * GoalModal
 * 
 * Modal dialog for creating or editing goals.
 * - Name input
 * - Target minutes selector
 * - Schedule day picker
 */
export function GoalModal({ isOpen, onClose, goal }: GoalModalProps) {
  const { createGoal, updateGoal } = useGoalStore();
  
  const [name, setName] = useState('');
  const [targetMinutes, setTargetMinutes] = useState(30);
  const [scheduleDays, setScheduleDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!goal;

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetMinutes(goal.targetMinutes);
      setScheduleDays([...goal.scheduleDays]);
    } else {
      // Reset form for new goal
      setName('');
      setTargetMinutes(30);
      setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
    }
    setError('');
  }, [goal, isOpen]);

  // Toggle a day in schedule
  const toggleDay = (day: number) => {
    if (scheduleDays.includes(day)) {
      // Don't allow removing all days
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter(d => d !== day));
      }
    } else {
      setScheduleDays([...scheduleDays, day].sort());
    }
  };

  // Quick schedule presets
  const setPreset = (preset: 'everyday' | 'weekdays' | 'weekends') => {
    switch (preset) {
      case 'everyday':
        setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
        break;
      case 'weekdays':
        setScheduleDays([1, 2, 3, 4, 5]);
        break;
      case 'weekends':
        setScheduleDays([0, 6]);
        break;
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a goal name');
      return;
    }

    if (targetMinutes < 1) {
      setError('Target minutes must be at least 1');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing && goal) {
        const data: UpdateGoalRequest = {
          name: name.trim(),
          targetMinutes,
          scheduleDays,
        };
        await updateGoal(goal.id, data);
      } else {
        const data: CreateGoalRequest = {
          name: name.trim(),
          targetMinutes,
          scheduleDays,
        };
        await createGoal(data);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <GlassCard 
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
        solid
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {isEditing ? 'Edit Goal' : 'New Goal'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Name input */}
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Learn Spanish"
              autoFocus
            />
          </div>

          {/* Target minutes */}
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Target Minutes</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(parseInt(e.target.value) || 0)}
                min={1}
                max={480}
                className="w-24 text-center font-mono text-xl"
              />
              <span className="text-white/40">minutes per day</span>
            </div>
            {/* Quick presets */}
            <div className="flex gap-2 mt-2">
              {[15, 30, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTargetMinutes(mins)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors
                            ${targetMinutes === mins 
                              ? 'bg-white/20 text-white' 
                              : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Schedule days */}
          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-2">Schedule</label>
            
            {/* Presets */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPreset('everyday')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors
                          ${scheduleDays.length === 7 
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              >
                Every day
              </button>
              <button
                type="button"
                onClick={() => setPreset('weekdays')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors
                          ${scheduleDays.length === 5 && !scheduleDays.includes(0)
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => setPreset('weekends')}
                className={`px-3 py-1 rounded-lg text-sm transition-colors
                          ${scheduleDays.length === 2 && scheduleDays.includes(0)
                            ? 'bg-white/20 text-white' 
                            : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              >
                Weekends
              </button>
            </div>

            {/* Day toggles */}
            <div className="flex gap-2">
              {DAY_NAMES.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                            ${scheduleDays.includes(index)
                              ? 'gradient-primary text-white'
                              : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
