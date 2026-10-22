import React from 'react';

export function DonutChart({ data }) {
  const items = data?.items || [
    { label: 'Students', value: 0, color: 'var(--p1)' },
    { label: 'Teachers', value: 0, color: '#2B8791' },
    { label: 'Guardians', value: 0, color: '#F59E6C' },
  ];
  const total = data?.total ?? items.reduce((acc, it) => acc + (it.value || 0), 0);

  const CIRCUMFERENCE = 365;
  let cumulativeOffset = 0;

  const segments = items.map((it) => {
    const fraction = total > 0 ? it.value / total : 0;
    const dashLength = fraction * CIRCUMFERENCE;
    const offset = -cumulativeOffset;
    cumulativeOffset += dashLength;
    return {
      ...it,
      dashArray: `${dashLength} ${CIRCUMFERENCE}`,
      dashOffset: offset,
    };
  });

  return (
    <div className="cd">
      <h3>Community mix</h3>
      <svg viewBox="0 0 160 160" width="170" style={{ margin: '6px auto', display: 'block' }}>
        <g fill="none" strokeWidth="16" transform="rotate(-90 80 80)">
          {/* Background circle */}
          <circle cx="80" cy="80" r="58" stroke="var(--soft)" />

          {total > 0 &&
            segments.map((seg, idx) => (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r="58"
                stroke={seg.color}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
              />
            ))}
        </g>
        <text
          x="80"
          y="74"
          textAnchor="middle"
          fontSize="9"
          fill="var(--mute)"
          fontFamily="Manrope, sans-serif"
          fontWeight="700"
          letterSpacing="0.08em"
        >
          PEOPLE
        </text>
        <text
          x="80"
          y="96"
          textAnchor="middle"
          fontSize="26"
          fontWeight="800"
          fill="var(--ink)"
          fontFamily="'Bricolage Grotesque', serif"
        >
          {total}
        </text>
      </svg>
      {items.map((l, idx) => (
        <div key={idx} className="lg">
          <span>
            <i style={{ background: l.color }} />
            {l.label}
          </span>
          <b>{l.value}</b>
        </div>
      ))}
    </div>
  );
}
