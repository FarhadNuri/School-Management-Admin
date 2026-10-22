import React from 'react';

const GRADIENTS = [
  '#2B8791, #E7C9A3',
  '#14525B, #F59E6C',
  '#E7C9A3, #1E6F78',
  '#F59E6C, #14525B',
  '#1E6F78, #E7C9A3',
];

export function Avatar({ index = 0, size = 42, radius = 12, src, alt = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${radius}px`,
          objectFit: 'cover',
          flex: 'none',
        }}
      />
    );
  }

  const gradient = GRADIENTS[index % GRADIENTS.length];
  return (
    <span
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        flex: 'none',
        background: `linear-gradient(135deg, ${gradient})`,
        display: 'inline-block',
      }}
    />
  );
}
