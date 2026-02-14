import { motion } from 'framer-motion';
import type { GoalWithStatus } from '../types';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: GoalWithStatus | null;
}

export function DescriptionModal({ isOpen, onClose, goal }: DescriptionModalProps) {
  if (!isOpen || !goal) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="modal-panel description-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{goal.name}</h2>
          <button type="button" onClick={onClose} className="modal-close">
            <svg className="icon icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="description-modal-body">
          {goal.description ? (
            <p className="description-modal-text">{goal.description}</p>
          ) : (
            <p className="description-modal-empty">No description available for this goal.</p>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-glow description-modal-close-btn">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
