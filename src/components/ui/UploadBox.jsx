import React from 'react';

export function UploadBox({ label, title = 'Tap to upload', hint = 'Clear scan preferred', onClick, style }) {
  return (
    <div style={style}>
      {label && <label>{label}</label>}
      <div className="up" onClick={onClick} role="button" tabIndex={0}>
        <b>{title}</b>
        <small>{hint}</small>
      </div>
    </div>
  );
}
