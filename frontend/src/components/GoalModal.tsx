import { useState, useEffect } from 'react';
import { DAY_NAMES, UNIT_OPTIONS, type GoalWithStatus, type CreateGoalRequest, type UpdateGoalRequest } from '../types';
import { useGoalStore } from '../stores/goalStore';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: GoalWithStatus | null;
}

type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';

/**
 * GoalModal - Smart Glass Design
 * 
 * Features:
 * - Goal Type Toggle: Simple (checkbox) vs Measurable (tracked value)
 * - Digital slot input for target values
 * - Schedule presets with custom day pills
 * - Glassmorphism design
 */
export function GoalModal({ isOpen, onClose, goal }: GoalModalProps) {
  const { createGoal, updateGoal } = useGoalStore();
  
  // Form state
  const [name, setName] = useState('');
  const [isMeasurable, setIsMeasurable] = useState(false);
  const [targetValue, setTargetValue] = useState(30);
  const [unit, setUnit] = useState('minutes');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [scheduleDays, setScheduleDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!goal;

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setIsMeasurable(goal.isMeasurable);
      setTargetValue(goal.targetValue || 30);
      setUnit(goal.unit || 'minutes');
      setScheduleDays([...goal.scheduleDays]);
      // Determine frequency type from schedule
      if (goal.scheduleDays.length === 7) {
        setFrequencyType('daily');
      } else if (goal.scheduleDays.length === 5 && !goal.scheduleDays.includes(0) && !goal.scheduleDays.includes(6)) {
        setFrequencyType('weekdays');
      } else if (goal.scheduleDays.length === 2 && goal.scheduleDays.includes(0) && goal.scheduleDays.includes(6)) {
        setFrequencyType('weekends');
      } else {
        setFrequencyType('custom');
      }
    } else {
      // Reset form for new goal
      setName('');
      setIsMeasurable(false);
      setTargetValue(30);
      setUnit('minutes');
      setFrequencyType('daily');
      setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
    }
    setError('');
  }, [goal, isOpen]);

  // Handle frequency type change
  const handleFrequencyChange = (type: FrequencyType) => {
    setFrequencyType(type);
    switch (type) {
      case 'daily':
        setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
        break;
      case 'weekdays':
        setScheduleDays([1, 2, 3, 4, 5]);
        break;
      case 'weekends':
        setScheduleDays([0, 6]);
        break;
      case 'custom':
        // Keep current selection
        break;
    }
  };

  // Toggle a day (for custom schedule)
  const toggleDay = (day: number) => {
    setFrequencyType('custom');
    if (scheduleDays.includes(day)) {
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter(d => d !== day));
      }
    } else {
      setScheduleDays([...scheduleDays, day].sort());
    }
  };

  // Increment/decrement target value
  const adjustValue = (delta: number) => {
    setTargetValue(prev => Math.max(1, Math.min(999, prev + delta)));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a goal name');
      return;
    }

    if (isMeasurable && targetValue < 1) {
      setError('Target value must be at least 1');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEditing && goal) {
        const data: UpdateGoalRequest = {
          name: name.trim(),
          isMeasurable,
          targetValue: isMeasurable ? targetValue : 0,
          unit: isMeasurable ? unit : 'minutes',
          scheduleDays,
        };
        await updateGoal(goal.id, data);
      } else {
        const data: CreateGoalRequest = {
          name: name.trim(),
          isMeasurable,
          targetValue: isMeasurable ? targetValue : 0,
          unit: isMeasurable ? unit : 'minutes',
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
      <div className="modal-panel smart-modal" onClick={(e) => e.stopPropagation()}>
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
            <div className="modal-error">
              {error}
            </div>
          )}

          {/* Goal Name */}
          <div className="modal-input-group">
            <label className="modal-label">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Meditate, Read, Exercise"
              autoFocus
              className="modal-input"
            />
          </div>

          {/* Goal Type Toggle */}
          <div className="modal-input-group">
            <label className="modal-label">Goal Type</label>
            <div className="goal-type-toggle">
              <button
                type="button"
                className={`type-btn ${!isMeasurable ? 'active' : ''}`}
                onClick={() => setIsMeasurable(false)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simple
              </button>
              <button
                type="button"
                className={`type-btn ${isMeasurable ? 'active' : ''}`}
                onClick={() => setIsMeasurable(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Measurable
              </button>
            </div>
            <p className="type-hint">
              {isMeasurable 
                ? 'Track a specific amount (e.g., 30 minutes, 20 pages)' 
                : 'Just check it off when done'}
            </p>
          </div>

          {/* Measurable Options - Conditional */}
          {isMeasurable && (
            <div className="measurable-options">
              <label className="modal-label">Target</label>
              <div className="input-row">
                {/* Digital Input with +/- buttons */}
                <div className="digital-input-container">
                  <button 
                    type="button" 
                    className="digital-btn minus"
                    onClick={() => adjustValue(-5)}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                    min={1}
                    max={999}
                    className="digital-input"
                  />
                  <button 
                    type="button" 
                    className="digital-btn plus"
                    onClick={() => adjustValue(5)}
                  >
                    +
                  </button>
                </div>
                
                {/* Unit Selector */}
                <select 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  className="unit-select"
                >
                  {UNIT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Quick presets */}
              <div className="value-presets">
                {[15, 30, 45, 60].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTargetValue(val)}
                    className={`preset-chip ${targetValue === val ? 'active' : ''}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="modal-input-group">
            <label className="modal-label">Schedule</label>
            
            {/* Frequency Presets */}
            <div className="frequency-toggle">
              {(['daily', 'weekdays', 'weekends', 'custom'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleFrequencyChange(type)}
                  className={`freq-btn ${frequencyType === type ? 'active' : ''}`}
                >
                  {type === 'daily' && 'Every Day'}
                  {type === 'weekdays' && 'Weekdays'}
                  {type === 'weekends' && 'Weekends'}
                  {type === 'custom' && 'Custom'}
                </button>
              ))}
            </div>

            {/* Day Pills - Always show for custom, or show selected for others */}
            <div className="schedule-grid">
              {DAY_NAMES.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={`day-pill ${scheduleDays.includes(index) ? 'active' : ''}`}
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
