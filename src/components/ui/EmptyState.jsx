import React from 'react';

export function EmptyState({ title = 'No records found', description = 'Try adjusting your search or filters.' }) {
  return (
    <div className="cd" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--mute)' }}>
      <b style={{ display: 'block', color: 'var(--ink)', marginBottom: '4px', fontSize: '15px' }}>{title}</b>
      <span>{description}</span>
    </div>
  );
}
