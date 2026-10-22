import React from 'react';

export function MultiSelectChips({ label, options = [], selected = [], onChange, style }) {
  const toggle = (val) => {
    const isSelected = selected.includes(val);
    if (isSelected) {
      onChange(selected.filter((item) => item !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div style={style}>
      {label && <label>{label}</label>}
      <div className="chips" style={{ marginTop: '6px' }}>
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.id || opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.name || opt.label || opt.className || opt.courseName : opt;
          const isSelected = selected.includes(value);

          return (
            <button
              key={value}
              type="button"
              className={`ch ${isSelected ? 'on' : ''}`}
              onClick={() => toggle(value)}
            >
              {labelText}
            </button>
          );
        })}
      </div>
    </div>
  );
}
