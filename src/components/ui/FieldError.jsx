import React from 'react';

export function FieldError({ error }) {
  if (!error) return null;
  return (
    <div
      style={{
        color: '#C23A52',
        fontSize: '12px',
        marginTop: '4px',
        fontWeight: 600,
        lineHeight: 1.3,
      }}
    >
      {error}
    </div>
  );
}
