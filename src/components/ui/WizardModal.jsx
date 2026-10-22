import React, { useEffect } from 'react';

export function WizardModal({
  isOpen,
  onClose,
  title,
  subtitle,
  steps = [],
  currentStep = 0,
  onNext,
  onBack,
  submitLabel = 'Save',
  isLastStep = false,
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="md on"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="mc" style={{ width: '780px' }}>
        <div className="mh">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="mb">
          {steps.length > 1 && (
            <div className="stp">
              {steps.map((stepName, n) => {
                const isDone = n < currentStep;
                const isActive = n === currentStep;
                return (
                  <div
                    key={stepName}
                    className={`${isDone ? 'dn' : ''} ${isActive ? 'on' : ''}`}
                  >
                    <i>{isDone ? '✓' : n + 1}</i>
                    {stepName}
                  </div>
                );
              })}
            </div>
          )}

          {children}

          <div className="row" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
            <button
              type="button"
              className="ghost"
              style={{ margin: 0 }}
              onClick={currentStep > 0 ? onBack : onClose}
            >
              {currentStep > 0 ? '← Back' : 'Cancel'}
            </button>
            <button type="button" className="pb" onClick={onNext}>
              {isLastStep ? submitLabel : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
