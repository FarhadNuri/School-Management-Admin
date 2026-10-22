import React, { useRef, useState } from 'react';
import { FieldError } from './FieldError';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function FileInput({
  label,
  file,
  existingUrl,
  currentPreviewUrl,
  onChange,
  onSelectFile,
  onClear,
  accept = 'image/*,application/pdf',
  title = 'Tap to upload',
  hint = 'Clear scan preferred (max 5MB)',
  error,
  style,
}) {
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState('');

  const callback = onChange || onSelectFile || (() => {});
  const effectiveUrl = existingUrl || currentPreviewUrl;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_SIZE) {
      setLocalError('File size exceeds 5MB limit.');
      return;
    }

    const isValidType =
      selected.type.startsWith('image/') || selected.type === 'application/pdf';
    if (!isValidType) {
      setLocalError('Only images (JPEG, PNG, WebP) and PDF documents are allowed.');
      return;
    }

    setLocalError('');
    callback(selected);
  };

  const previewUrl = file
    ? file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : null
    : effectiveUrl;

  const isPdf =
    file?.type === 'application/pdf' ||
    (typeof existingUrl === 'string' && existingUrl.endsWith('.pdf'));

  return (
    <div style={style}>
      {label && <label>{label}</label>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div
        className="up"
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        style={{
          borderColor: localError || error ? '#C23A52' : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {previewUrl && !isPdf ? (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              objectFit: 'cover',
              marginBottom: '4px',
            }}
          />
        ) : isPdf ? (
          <div
            style={{
              padding: '6px 12px',
              background: 'rgba(214,69,90,.12)',
              color: '#C23A52',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '11px',
            }}
          >
            PDF DOCUMENT ATTACHED
          </div>
        ) : null}

        <b>{file ? file.name : title}</b>
        <small>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : hint}</small>
      </div>

      <FieldError error={localError || error} />
    </div>
  );
}
