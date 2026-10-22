import React from 'react';

export function IconStat({ icon, tint = '', label, value, note }) {
  return (
    <div className="sc sx">
      <span className={`ib ${tint}`}>{icon}</span>
      <div>
        <small>{label}</small>
        <b>{value}</b>
        <span>{note}</span>
      </div>
    </div>
  );
}
