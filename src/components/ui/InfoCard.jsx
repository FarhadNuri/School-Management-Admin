import React from 'react';
import { DataRow } from './DataRow';

export function InfoCard({ title, rows, children, style, className = '' }) {
  return (
    <div className={`cd ${className}`} style={style}>
      {title && (
        <small style={{ letterSpacing: '.1em', fontWeight: 700, color: 'var(--mute)', textTransform: 'uppercase' }}>
          {title}
        </small>
      )}
      {rows && rows.length > 0 ? (
        rows.map(([label, val], idx) => <DataRow key={idx} label={label} value={val} />)
      ) : (
        children
      )}
    </div>
  );
}
