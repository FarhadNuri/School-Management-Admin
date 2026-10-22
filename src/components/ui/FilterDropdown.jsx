import React from 'react';

export function FilterDropdown({ label, value, options = [], onChange }) {
  return (
    <div className="sel">
      <small>{label}</small>
      <b>{value}</b>
      {options.length > 0 && (
        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          aria-label={label}
        >
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
