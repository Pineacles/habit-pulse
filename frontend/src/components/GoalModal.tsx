import { useState, useEffect } from 'react';
import { DAY_NAMES, type GoalWithStatus, type CreateGoalRequest, type UpdateGoalRequest } from '../types';
import { useGoalStore } from '../stores/goalStore';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: GoalWithStatus | null;
}

/**
 * GoalModal - Glass Hologram Design
 * 
 * Features:
 * - Heavy backdrop blur
 * - Glass panel matching login card style
 * - Cockpit slot inputs
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
      setName('');
      setTargetMinutes(30);
      setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
    }
    setError('');
  }, [goal, isOpen]);

  // Toggle a day
  const toggleDay = (day: number) => {
    if (scheduleDays.includes(day)) {
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter(d => d !== day));
      }
    } else {
      setScheduleDays([...scheduleDays, day].sort());
    }
  };

  // Presets
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

  // Submit
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
    <div className="modal-backdrop" onClick={onClose}>
      {/* Modal Panel */}
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">
              {isEditing ? 'Edit Goal' : 'New Goal'}
            </h2>
            <button type="button" onClick={onClose} className="modal-close">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="modal-input-group">
            <label className="modal-label">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Learn Spanish"
              autoFocus
            />
          </div>

          {/* Target Minutes */}
          <div className="modal-input-group">
            <label className="modal-label">Target Minutes</label>
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
            <div className="preset-buttons">
              {[15, 30, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTargetMinutes(mins)}
                  className={`preset-btn ${targetMinutes === mins ? 'active' : ''}`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="modal-input-group">
            <label className="modal-label">Schedule</label>
            
            {/* Presets */}
            <div className="preset-buttons" style={{ marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setPreset('everyday')}
                className={`preset-btn ${scheduleDays.length === 7 ? 'active' : ''}`}
              >
                Every day
              </button>
              <button
                type="button"
                onClick={() => setPreset('weekdays')}
                className={`preset-btn ${scheduleDays.length === 5 && !scheduleDays.includes(0) ? 'active' : ''}`}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => setPreset('weekends')}
                className={`preset-btn ${scheduleDays.length === 2 && scheduleDays.includes(0) ? 'active' : ''}`}
              >
                Weekends
              </button>
            </div>

            {/* Day toggles */}
            <div className="day-selector">
              {DAY_NAMES.map((day, index) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`day-btn ${scheduleDays.includes(index) ? 'active' : ''}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
