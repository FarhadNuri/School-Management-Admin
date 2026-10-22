import React from 'react';

export function ViewToggle({ total, label, mode = 'grid', onChange }) {
  return (
    <div className="row" style={{ margin: '6px 0 14px', color: 'var(--mute)' }}>
      Showing <b style={{ color: 'var(--ink)' }}>{total}</b>&nbsp;{label}
      <span className="vt" style={{ marginLeft: 'auto' }}>
        <button
          type="button"
          className={mode === 'grid' ? 'on' : ''}
          onClick={() => onChange && onChange('grid')}
          aria-label="Grid view"
          title="Grid view"
        >
          ▦
        </button>
        <button
          type="button"
          className={mode === 'list' ? 'on' : ''}
          onClick={() => onChange && onChange('list')}
          aria-label="List view"
          title="List view"
        >
          ≡
        </button>
      </span>
    </div>
  );
}
