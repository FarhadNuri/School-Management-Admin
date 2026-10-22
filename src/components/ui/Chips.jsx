import React from 'react';

export function Chips({ items = [], activeItem, onSelect }) {
  return (
    <div className="chips">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={`ch ${activeItem === item ? 'on' : ''}`}
          onClick={() => onSelect && onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
