import React from 'react';

export function StatCard({ label, value, tint = '' }) {
  return (
    <div className={`sc ${tint}`}>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}
