import { ReactNode } from 'react';

interface AccordionSectionProps {
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * AccordionSection - Collapsible section with summary when closed
 */
export function AccordionSection({
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: AccordionSectionProps) {
  return (
    <div className={`accordion-section ${isOpen ? 'open' : ''}`}>
      {/* Header - Always visible */}
      <button
        type="button"
        className="accordion-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="accordion-title-row">
          <svg 
            className={`accordion-chevron ${isOpen ? 'rotated' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="accordion-title">{title}</span>
        </div>
        
        {/* Show summary only when collapsed */}
        {!isOpen && (
          <span className="accordion-summary">{summary}</span>
        )}
      </button>

      {/* Body - Collapsible */}
      <div className={`accordion-body ${isOpen ? 'expanded' : ''}`}>
        <div className="accordion-content">
          {children}
        </div>
      </div>
    </div>
  );
}
