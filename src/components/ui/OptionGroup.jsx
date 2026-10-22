import React from 'react';

export function OptionGroup({ label, options = [], value, onChange, style }) {
  return (
    <div style={style}>
      {label && <label>{label}</label>}
      <div className="opt">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={value === opt ? 'on' : ''}
            onClick={() => onChange && onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
