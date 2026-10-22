import React from 'react';

export function DataRow({ label, value }) {
  return (
    <div className="kv">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
