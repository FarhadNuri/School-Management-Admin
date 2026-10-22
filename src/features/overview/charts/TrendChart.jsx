import React from 'react';

export function TrendChart({ data }) {
  const labels = data?.labels || ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const gridLines = data?.gridLines || [20, 60, 100, 140];
  const area = data?.area || 'M28 160 L90 160 L150 160 L205 154 L250 120 L310 22 L310 160 L28 160Z';
  const points = data?.points || 'M28 160 L90 160 L150 160 L205 154 L250 120 L310 22';

  return (
    <div className="cd">
      <h3>Enrollment trend</h3>
      <svg viewBox="0 0 320 190" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="enrollmentTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1E6F78" stopOpacity=".3" />
            <stop offset="1" stopColor="#1E6F78" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="var(--line)" strokeDasharray="3 4">
          {gridLines.map((y) => (
            <line key={y} x1="28" x2="312" y1={y} y2={y} />
          ))}
        </g>
        <path d={area} fill="url(#enrollmentTrendGrad)" />
        <path
          d={points}
          fill="none"
          stroke="var(--p1)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g fontSize="9" fill="var(--mute)" textAnchor="middle" fontFamily="Manrope, sans-serif">
          {labels.map((m, i) => (
            <text key={m} x={28 + i * 56} y="180">
              {m} 26
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
