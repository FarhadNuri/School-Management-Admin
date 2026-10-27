import React, { useState } from 'react';

export function ClassImageTile({
  src,
  grade = '—',
  size = 48,
  radius = 12,
  alt = '',
  style = {},
}) {
  const [hasError, setHasError] = useState(false);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt || `Class Grade ${grade}`}
        onError={() => setHasError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${radius}px`,
          objectFit: 'cover',
          flex: 'none',
          ...style,
        }}
      />
    );
  }

  const isLarge = size > 50;

  return (
    <span
      className="dt"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        paddingTop: isLarge ? '10px' : '7px',
        flex: 'none',
        ...style,
      }}
    >
      <small style={{ fontSize: isLarge ? '10px' : '8px' }}>
        {isLarge ? 'GRADE' : 'GR'}
      </small>
      <b style={{ fontSize: isLarge ? '24px' : '16px' }}>{grade}</b>
    </span>
  );
}
