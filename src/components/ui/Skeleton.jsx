import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = '12px', style }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--soft)',
        opacity: 0.8,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="cd" style={{ gap: '12px', minHeight: '180px' }}>
      <div className="row">
        <Skeleton width="42px" height="42px" borderRadius="12px" />
        <div style={{ flex: 1, display: 'grid', gap: '6px' }}>
          <Skeleton width="60%" height="16px" />
          <Skeleton width="40%" height="12px" />
        </div>
      </div>
      <div className="row" style={{ gap: '8px' }}>
        <Skeleton width="70px" height="20px" borderRadius="9px" />
        <Skeleton width="50px" height="20px" borderRadius="9px" />
      </div>
      <Skeleton width="80%" height="14px" />
      <div className="row" style={{ marginTop: 'auto' }}>
        <Skeleton width="50%" height="12px" />
        <Skeleton width="80px" height="30px" borderRadius="12px" style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  );
}
