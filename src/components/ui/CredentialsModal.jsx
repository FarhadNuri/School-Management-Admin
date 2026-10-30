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

    return (
      <div
        className="cd"
        style={{
          padding: '16px',
          background: 'var(--soft)',
          borderRadius: '16px',
          border: '1px solid var(--line)',
          display: 'grid',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
            <User size={16} strokeWidth={2.2} />
            <b style={{ fontSize: '15px' }}>{account.name || label}</b>
          </div>
          <Tag color={color}>{label}</Tag>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          {/* Email row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card)',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
              <Mail size={15} color="var(--mute)" style={{ flexShrink: 0 }} />
              <span
                style={{
                  color: 'var(--ink)',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  wordBreak: 'break-all',
                }}
              >
                {account.email}
              </span>
            </div>
            <button
              type="button"
              className="ghost"
              style={{
                padding: '6px 10px',
                margin: 0,
                height: 'auto',
                fontSize: '12px',
                color: 'var(--ink)',
                borderColor: 'var(--line)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onClick={() => copyToClipboard(account.email, `${typeKey}-email`)}
              title="Copy Email"
            >
              {copiedKey === `${typeKey}-email` ? (
                <>
                  <Check size={14} color="#10B981" />
                  <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 600 }}>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span style={{ fontSize: '11px' }}>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Password row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card)',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
              <Key size={15} color="var(--mute)" style={{ flexShrink: 0 }} />
              <code
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: 'var(--ink)',
                  letterSpacing: isVisible ? '0.5px' : '2px',
                  userSelect: 'all',
                }}
              >
                {isVisible ? account.password : '••••••••••••'}
              </code>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="ghost"
                style={{
                  padding: '6px 10px',
                  margin: 0,
                  height: 'auto',
                  fontSize: '12px',
                  color: 'var(--ink)',
                  borderColor: 'var(--line)',
                }}
                onClick={() => togglePassword(typeKey)}
                title={isVisible ? 'Hide Password' : 'Show Password'}
              >
                {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                type="button"
                className="ghost"
                style={{
                  padding: '6px 10px',
                  margin: 0,
                  height: 'auto',
                  fontSize: '12px',
                  color: 'var(--ink)',
                  borderColor: 'var(--line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onClick={() => copyToClipboard(account.password, `${typeKey}-pass`)}
                title="Copy Password"
              >
                {copiedKey === `${typeKey}-pass` ? (
                  <>
                    <Check size={14} color="#10B981" />
                    <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 600 }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span style={{ fontSize: '11px' }}>Copy</span>
                  </>
                )}
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
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(35, 137, 91, 0.15)',
              border: '1px solid rgba(35, 137, 91, 0.35)',
              fontSize: '13px',
              color: '#34D399',
            }}
          >
            <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0 }} />
            <span>Credentials have also been dispatched to the user's email address.</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 108, 0.12)',
              border: '1px solid rgba(245, 158, 108, 0.35)',
              fontSize: '13px',
              color: '#F59E6C',
            }}
          >
            <AlertTriangle size={18} color="#F59E6C" style={{ flexShrink: 0, marginTop: '2px' }} />
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink)' }}
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
