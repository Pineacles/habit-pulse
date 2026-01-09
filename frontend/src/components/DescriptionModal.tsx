import { motion } from 'framer-motion';
import type { GoalWithStatus } from '../types';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: GoalWithStatus | null;
}

export function DescriptionModal({ isOpen, onClose, goal }: DescriptionModalProps) {
  if (!isOpen || !goal || !goal.description) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{goal.name}</h2>
          <button type="button" onClick={onClose} className="modal-close">
            <svg className="icon icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <div style={{ padding: '20px 0' }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            fontSize: '15px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {goal.description}
          </p>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-glow" style={{ width: '100%' }}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
