import React from 'react';

export function DateTile({ month, day, style }) {
  return (
    <span className="dt" style={style}>
      {month}
      <b>{day}</b>
    </span>
  );
}
