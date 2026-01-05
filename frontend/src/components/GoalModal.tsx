import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import { DAY_NAMES, UNIT_OPTIONS, type GoalWithStatus, type CreateGoalRequest, type UpdateGoalRequest } from '../types';
import { useGoalStore } from '../stores/goalStore';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: GoalWithStatus | null;
}

type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'custom';
type CustomMode = 'specific-days' | 'interval';

// Spring animation for snappy feel
const spring = { type: 'spring', stiffness: 400, damping: 30 };

export function GoalModal({ isOpen, onClose, goal }: GoalModalProps) {
  const { createGoal, updateGoal } = useGoalStore();
  
  // Form state
  const [name, setName] = useState('');
  const [isMeasurable, setIsMeasurable] = useState(false);
  const [targetValue, setTargetValue] = useState(30);
  const [unit, setUnit] = useState('minutes');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [scheduleDays, setScheduleDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  
  // Interval scheduling state
  const [customMode, setCustomMode] = useState<CustomMode>('specific-days');
  const [intervalDays, setIntervalDays] = useState(2);
  const [intervalStartDate, setIntervalStartDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  // Active editing section
  const [activeEdit, setActiveEdit] = useState<'target' | 'interval' | null>(null);
  
  // Calendar drawer state - ONLY opened by explicit icon click
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!goal;
  const isIntervalMode = frequencyType === 'custom' && customMode === 'interval';
  
  // Calendar only shows when explicitly opened AND we're in interval mode
  const shouldShowCalendar = showCalendar && isIntervalMode && activeEdit === 'interval';

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setIsMeasurable(goal.isMeasurable);
      setTargetValue(goal.targetValue || 30);
      setUnit(goal.unit || 'minutes');
      setScheduleDays([...goal.scheduleDays]);
      
      if (goal.intervalDays && goal.intervalStartDate) {
        setFrequencyType('custom');
        setCustomMode('interval');
        setIntervalDays(goal.intervalDays);
        setIntervalStartDate(goal.intervalStartDate);
        setActiveEdit('interval');
      } else {
        setCustomMode('specific-days');
        setActiveEdit(goal.isMeasurable ? 'target' : null);
        if (goal.scheduleDays.length === 7) {
          setFrequencyType('daily');
        } else if (goal.scheduleDays.length === 5 && !goal.scheduleDays.includes(0) && !goal.scheduleDays.includes(6)) {
          setFrequencyType('weekdays');
        } else if (goal.scheduleDays.length === 2 && goal.scheduleDays.includes(0) && goal.scheduleDays.includes(6)) {
          setFrequencyType('weekends');
        } else {
          setFrequencyType('custom');
        }
      }
    } else {
      setName('');
      setIsMeasurable(false);
      setTargetValue(30);
      setUnit('minutes');
      setFrequencyType('daily');
      setScheduleDays([0, 1, 2, 3, 4, 5, 6]);
      setCustomMode('specific-days');
      setIntervalDays(2);
      setIntervalStartDate(new Date().toISOString().split('T')[0]);
      setActiveEdit(null);
    }
    setError('');
    setShowCalendar(false); // Always start with calendar closed
  }, [goal, isOpen]);

  // Handle measurable toggle - closes calendar when switching to target
  const handleMeasurableChange = (measurable: boolean) => {
    setIsMeasurable(measurable);
    if (measurable) {
      setActiveEdit('target');
      setShowCalendar(false); // Close calendar
    } else {
      setActiveEdit(isIntervalMode ? 'interval' : null);
    }
  };

  // Handle frequency type change
  const handleFrequencyChange = (type: FrequencyType) => {
    setFrequencyType(type);
    setShowCalendar(false); // Close calendar on any frequency change
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
        break;
    }
    if (type !== 'custom' || customMode !== 'interval') {
      if (isMeasurable) setActiveEdit('target');
    }
  };

  // Handle custom mode change - NO automatic calendar open
  const handleCustomModeChange = (mode: CustomMode) => {
    setCustomMode(mode);
    setShowCalendar(false); // Close calendar when switching modes
    if (mode === 'interval') {
      setActiveEdit('interval');
      // Calendar stays closed - only opens via icon click
    } else {
      if (isMeasurable) setActiveEdit('target');
      else setActiveEdit(null);
    }
  };

  // Toggle a day
  const toggleDay = (day: number) => {
    setFrequencyType('custom');
    setCustomMode('specific-days');
    setShowCalendar(false);
    if (isMeasurable) setActiveEdit('target');
    if (scheduleDays.includes(day)) {
      if (scheduleDays.length > 1) {
        setScheduleDays(scheduleDays.filter(d => d !== day));
      }
    } else {
      setScheduleDays([...scheduleDays, day].sort());
    }
  };

  // Adjust values
  const adjustValue = (delta: number) => {
    setTargetValue(prev => Math.max(1, Math.min(999, prev + delta)));
  };

  const adjustInterval = (delta: number) => {
    setIntervalDays(prev => Math.max(1, Math.min(365, prev + delta)));
  };

  // Handle calendar date selection - use local date formatting
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Format as YYYY-MM-DD using local date parts (not UTC)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setIntervalStartDate(`${year}-${month}-${day}`);
      setShowCalendar(false); // Close after selection
    }
  };

  // Open calendar - ONLY way to open it
  const openCalendar = () => {
    setActiveEdit('interval');
    setShowCalendar(true);
  };

  // Set to today
  const setToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setIntervalStartDate(`${year}-${month}-${day}`);
    setShowCalendar(false);
  };

  // Parse date string to local Date object
  const parseLocalDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get unit label
  const getUnitLabel = () => {
    const opt = UNIT_OPTIONS.find(o => o.value === unit);
    return opt?.label || unit;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a goal name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const useInterval = frequencyType === 'custom' && customMode === 'interval';
      
      if (isEditing && goal) {
        const data: UpdateGoalRequest = {
          name: name.trim(),
          isMeasurable,
          targetValue: isMeasurable ? targetValue : 0,
          unit: isMeasurable ? unit : 'minutes',
          scheduleDays: useInterval ? [0, 1, 2, 3, 4, 5, 6] : scheduleDays,
          intervalDays: useInterval ? intervalDays : null,
          intervalStartDate: useInterval ? intervalStartDate : null,
        };
        await updateGoal(goal.id, data);
      } else {
        const data: CreateGoalRequest = {
          name: name.trim(),
          isMeasurable,
          targetValue: isMeasurable ? targetValue : 0,
          unit: isMeasurable ? unit : 'minutes',
          scheduleDays: useInterval ? [0, 1, 2, 3, 4, 5, 6] : scheduleDays,
          intervalDays: useInterval ? intervalDays : null,
          intervalStartDate: useInterval ? intervalStartDate : null,
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

  // Determine what to show
  const showTargetExpanded = isMeasurable && activeEdit === 'target';
  const showTargetCollapsed = isMeasurable && activeEdit === 'interval';
  const showIntervalExpanded = isIntervalMode && activeEdit === 'interval';
  const showIntervalCollapsed = isIntervalMode && activeEdit === 'target';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Flex container with layout */}
      <motion.div 
        layout
        transition={spring}
        className="modal-flex-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Form Card */}
        <motion.div layout="position" className="modal-main-card">
          <form onSubmit={handleSubmit} className="modal-form">
            {/* Header */}
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? 'Edit Goal' : 'New Goal'}</h2>
              <button type="button" onClick={onClose} className="modal-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error */}
            {error && <div className="modal-error">{error}</div>}

            {/* Goal Name */}
            <div className="modal-section">
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
            <div className="modal-section">
              <label className="modal-label">Goal Type</label>
              <div className="goal-type-toggle">
                <button
                  type="button"
                  className={`type-btn ${!isMeasurable ? 'active' : ''}`}
                  onClick={() => handleMeasurableChange(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Simple</span>
                </button>
                <button
                  type="button"
                  className={`type-btn ${isMeasurable ? 'active' : ''}`}
                  onClick={() => handleMeasurableChange(true)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Measurable</span>
                </button>
              </div>
            </div>

            {/* Target Section - Expanded */}
            <AnimatePresence mode="popLayout">
              {showTargetExpanded && (
                <motion.div 
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={spring}
                  className="modal-section-animated"
                >
                  <div className="modal-section-inner">
                    <label className="modal-label">Target</label>
                    <div className="target-row">
                      <div className="digital-input-container">
                        <button type="button" className="digital-btn minus" onClick={() => adjustValue(-5)}>−</button>
                        <input
                          type="number"
                          value={targetValue}
                          onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                          min={1}
                          max={999}
                          className="digital-input"
                        />
                        <button type="button" className="digital-btn plus" onClick={() => adjustValue(5)}>+</button>
                      </div>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="unit-select">
                        {UNIT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Target Section - Collapsed */}
            <AnimatePresence mode="popLayout">
              {showTargetCollapsed && (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="collapsed-row clickable"
                  onClick={() => setActiveEdit('target')}
                >
                  <span className="collapsed-label">Target</span>
                  <span className="collapsed-value">{targetValue} {getUnitLabel()}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Schedule Section */}
            <div className="modal-section">
              <label className="modal-label">Schedule</label>
              
              {/* Frequency chips - nowrap, scrollable */}
              <div className="frequency-chips">
                {(['daily', 'weekdays', 'weekends', 'custom'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleFrequencyChange(type)}
                    className={`freq-chip ${frequencyType === type ? 'active' : ''}`}
                  >
                    {type === 'daily' && 'Every Day'}
                    {type === 'weekdays' && 'Weekdays'}
                    {type === 'weekends' && 'Weekends'}
                    {type === 'custom' && 'Custom'}
                  </button>
                ))}
              </div>

              {/* Custom options */}
              {frequencyType === 'custom' && (
                <div className="custom-schedule-section">
                  {/* Mode Toggle */}
                  <div className="segmented-control">
                    <button
                      type="button"
                      onClick={() => handleCustomModeChange('specific-days')}
                      className={`segment-btn ${customMode === 'specific-days' ? 'active' : ''}`}
                    >
                      Specific Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCustomModeChange('interval')}
                      className={`segment-btn ${customMode === 'interval' ? 'active' : ''}`}
                    >
                      By Interval
                    </button>
                  </div>

                  {/* Specific Days */}
                  {customMode === 'specific-days' && (
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
                  )}

                  {/* Interval - Expanded */}
                  <AnimatePresence mode="popLayout">
                    {customMode === 'interval' && showIntervalExpanded && (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={spring}
                        className="modal-section-animated"
                      >
                        <div className="interval-controls">
                          <div className="interval-row">
                            <span className="interval-text">Repeat every</span>
                            <div className="digital-input-container compact">
                              <button type="button" className="digital-btn minus" onClick={() => adjustInterval(-1)}>−</button>
                              <input
                                type="number"
                                value={intervalDays}
                                onChange={(e) => setIntervalDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                                min={1}
                                max={365}
                                className="digital-input"
                              />
                              <button type="button" className="digital-btn plus" onClick={() => adjustInterval(1)}>+</button>
                            </div>
                            <span className="interval-text">days</span>
                          </div>
                          
                          {/* Start Date Button - only opens calendar via icon */}
                          <button
                            type="button"
                            onClick={openCalendar}
                            className={`start-date-btn ${shouldShowCalendar ? 'active' : ''}`}
                          >
                            <span className="start-date-label">Starting</span>
                            <span className="start-date-value">
                              {formatDisplayDate(intervalStartDate)}
                              {shouldShowCalendar && <span className="pulse-dot" />}
                            </span>
                            <svg className="calendar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Interval - Collapsed */}
                  <AnimatePresence mode="popLayout">
                    {customMode === 'interval' && showIntervalCollapsed && (
                      <motion.div 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="collapsed-row clickable"
                        onClick={() => setActiveEdit('interval')}
                      >
                        <span className="collapsed-label">Interval</span>
                        <span className="collapsed-value">Every {intervalDays} days</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Day pills for non-custom */}
              {frequencyType !== 'custom' && (
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
              )}
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-ghost" disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-glow" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Calendar Drawer - Proper month grid */}
        <AnimatePresence mode="popLayout">
          {shouldShowCalendar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="calendar-drawer"
            >
              <div className="calendar-drawer-inner">
                {/* Header */}
                <div className="calendar-drawer-header">
                  <span className="calendar-drawer-title">Select start date</span>
                </div>
                
                {/* Calendar */}
                <DayPicker
                  mode="single"
                  selected={parseLocalDate(intervalStartDate)}
                  onSelect={handleDateSelect}
                  disabled={{ before: new Date() }}
                  weekStartsOn={1}
                  showOutsideDays={false}
                />
                
                {/* Quick Actions */}
                <div className="calendar-quick-actions">
                  <button type="button" onClick={setToday} className="calendar-action-btn">
                    Today
                  </button>
                  <button type="button" onClick={() => setShowCalendar(false)} className="calendar-action-btn secondary">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
