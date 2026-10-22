import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ClassSizesChart({ data = [] }) {
  const navigate = useNavigate();

  return (
    <div className="cd">
      <div className="row">
        <h3>Class sizes</h3>
        <b
          style={{
            marginLeft: 'auto',
            color: 'var(--p1)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/classes')}
        >
          All classes →
        </b>
      </div>
      {data.length === 0 ? (
        <div style={{ color: 'var(--mute)', fontSize: '13px', padding: '30px 0', textAlign: 'center' }}>
          No active classes enrolled
        </div>
      ) : (
        data.map((s, idx) => (
          <div key={idx} className="hb">
            <span>{s.name}</span>
            <u>
              <i style={{ width: `${s.max > 0 ? (s.count / s.max) * 100 : 0}%` }} />
            </u>
          </div>
        ))
      )}
    </div>
  );
}
