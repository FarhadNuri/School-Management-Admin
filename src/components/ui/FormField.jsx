import React from 'react';

export function FormField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  as = 'input',
  rows = 3,
  style,
  options = [],
}) {
  return (
    <div style={style}>
      {label && <label>{label}</label>}
      {as === 'textarea' ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
        />
      ) : as === 'select' ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </div>
  );
}
