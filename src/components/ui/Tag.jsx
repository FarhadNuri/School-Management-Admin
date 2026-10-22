import React from 'react';

export function Tag({ children, color = '', icon, className = '', style, onClick }) {
  return (
    <span
      className={`tg ${color} ${className}`}
      style={style}
      onClick={onClick}
    >
      {icon}
      {children}
    </span>
  );
}
