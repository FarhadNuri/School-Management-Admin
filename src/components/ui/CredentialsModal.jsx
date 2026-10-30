import React, { useState } from 'react';
import { CheckCircle, Copy, Check, Eye, EyeOff, Mail, Key, AlertTriangle, User } from 'lucide-react';
import { Modal } from './Modal';
import { Tag } from './Tag';

export function CredentialsModal({
  isOpen,
  onClose,
  title = 'Enrollment Successful',
  subtitle = 'Login credentials have been generated for this account.',
  credentials = null,
  emailSent = false,
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  if (!isOpen || !credentials) return null;

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const togglePassword = (key) => {
    setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const buildAllCredentialsText = () => {
    const lines = ['--- School Portal Login Credentials ---'];
    if (credentials.student) {
      lines.push(`\n[STUDENT ACCOUNT]`);
      lines.push(`Name: ${credentials.student.name || 'Student'}`);
      lines.push(`Email: ${credentials.student.email}`);
      lines.push(`Password: ${credentials.student.password}`);
    }
    if (credentials.guardian) {
      lines.push(`\n[GUARDIAN ACCOUNT]`);
      lines.push(`Name: ${credentials.guardian.name || 'Guardian'}`);
      lines.push(`Email: ${credentials.guardian.email}`);
      lines.push(`Password: ${credentials.guardian.password}`);
    }
    if (credentials.teacher) {
      lines.push(`\n[TEACHER ACCOUNT]`);
      lines.push(`Name: ${credentials.teacher.name || 'Teacher'}`);
      lines.push(`Email: ${credentials.teacher.email}`);
      lines.push(`Password: ${credentials.teacher.password}`);
    }
    lines.push('\nPortal URL: https://sunrisems.vercel.app/portal/login');
    return lines.join('\n');
  };

  const renderAccountCard = (account, typeKey, label, color) => {
    if (!account) return null;
    const isVisible = Boolean(showPassword[typeKey]);
    const isCopied = copiedKey === typeKey;

    return (
      <div
        className="cd"
        style={{
          padding: '16px',
          background: 'var(--bg, #f8f9fa)',
          borderRadius: '14px',
          border: '1px solid var(--border, #e5e7eb)',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} strokeWidth={2} />
            <b style={{ fontSize: '14px' }}>{account.name || label}</b>
          </div>
          <Tag color={color}>{label}</Tag>
        </div>

        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card-bg, #ffffff)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <Mail size={14} color="var(--mute, #6b7280)" />
              <span style={{ fontWeight: 500, wordBreak: 'break-all' }}>{account.email}</span>
            </div>
            <button
              type="button"
              className="ghost"
              style={{ padding: '4px 8px', margin: 0, height: 'auto', fontSize: '12px' }}
              onClick={() => copyToClipboard(account.email, `${typeKey}-email`)}
              title="Copy Email"
            >
              {copiedKey === `${typeKey}-email` ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card-bg, #ffffff)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border, #e5e7eb)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={14} color="var(--mute, #6b7280)" />
              <code
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '14px',
                  letterSpacing: isVisible ? '0.5px' : '2px',
                }}
              >
                {isVisible ? account.password : '••••••••••••'}
              </code>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className="ghost"
                style={{ padding: '4px 8px', margin: 0, height: 'auto', fontSize: '12px' }}
                onClick={() => togglePassword(typeKey)}
                title={isVisible ? 'Hide Password' : 'Show Password'}
              >
                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                type="button"
                className="ghost"
                style={{ padding: '4px 8px', margin: 0, height: 'auto', fontSize: '12px' }}
                onClick={() => copyToClipboard(account.password, `${typeKey}-pass`)}
                title="Copy Password"
              >
                {copiedKey === `${typeKey}-pass` ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} width={540}>
      <div style={{ display: 'grid', gap: '16px' }}>
        {emailSent ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '13px',
              color: '#065F46',
            }}
          >
            <CheckCircle size={18} color="#10B981" />
            <span>Credentials have also been dispatched to the user's email address.</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '12.5px',
              color: '#92400E',
            }}
          >
            <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Automated email delivery is offline or blocked by cloud firewall. <b>Please copy and share these credentials directly</b> with the user so they can sign in.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px' }}>
          {credentials.student && renderAccountCard(credentials.student, 'student', 'Student Account', 'b')}
          {credentials.guardian && renderAccountCard(credentials.guardian, 'guardian', 'Guardian Account', 'g')}
          {credentials.teacher && renderAccountCard(credentials.teacher, 'teacher', 'Teacher Account', 'p')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            className="ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => copyToClipboard(buildAllCredentialsText(), 'all')}
          >
            {copiedKey === 'all' ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
            <span>{copiedKey === 'all' ? 'Copied All to Clipboard!' : 'Copy All Details'}</span>
          </button>

          <button
            type="button"
            className="pb"
            style={{ minWidth: '100px' }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
