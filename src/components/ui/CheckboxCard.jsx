import React from 'react';

export function CheckboxCard({ checked = false, onChange, title, description, style }) {
  return (
    <div
      className={`cbx ${checked ? 'on' : ''}`}
      onClick={() => onChange && onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange && onChange(!checked);
        }
      }}
      style={style}
    >
      <i>{checked ? '✓' : ''}</i>
      <div>
        <b>{title}</b>
        {description && (
          <div style={{ color: 'var(--mute)', fontSize: '12px' }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}
