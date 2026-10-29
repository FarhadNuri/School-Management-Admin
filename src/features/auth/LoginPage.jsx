import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/endpoints/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  School,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('remember_admin_email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('remember_admin_email')));
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your work email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (rememberMe && email) {
        localStorage.setItem('remember_admin_email', email);
      } else {
        localStorage.removeItem('remember_admin_email');
      }

      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: `
          radial-gradient(circle at 18% 22%, rgba(30, 111, 120, 0.25) 0%, transparent 45%),
          radial-gradient(circle at 82% 78%, rgba(245, 158, 108, 0.16) 0%, transparent 45%),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          var(--bg)
        `,
        backgroundSize: '100% 100%, 100% 100%, 36px 36px, 36px 36px',
      }}
    >
      <div
        className="cd"
        style={{
          width: '440px',
          maxWidth: '100%',
          padding: '38px 34px 28px',
          borderRadius: '24px',
          background: 'var(--card)',
          border: '1px solid var(--line)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.08) inset',
          backdropFilter: 'blur(16px)',
          position: 'relative',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(30, 111, 120, 0.35), rgba(15, 59, 68, 0.6))',
              border: '1px solid rgba(43, 135, 145, 0.45)',
              boxShadow: '0 10px 24px rgba(15, 59, 68, 0.35)',
              margin: '0 auto 16px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <School size={28} color="var(--acc)" strokeWidth={2} />
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              margin: '0 0 6px',
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
            }}
          >
            Sunrise
          </h1>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 10px',
                borderRadius: '10px',
                background: 'rgba(30, 111, 120, 0.15)',
                color: '#2B8791',
                border: '1px solid rgba(43, 135, 145, 0.3)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              Administrator Portal
            </span>
          </div>

          <p
            style={{
              color: 'var(--mute)',
              fontSize: '13px',
              margin: '10px 0 0',
              lineHeight: 1.45,
            }}
          >
            Sign in to access student records, teachers, guardians, and academic operations.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              marginBottom: '20px',
              background: 'rgba(194, 58, 82, 0.12)',
              border: '1px solid rgba(194, 58, 82, 0.3)',
              color: '#F25570',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              lineHeight: 1.35,
            }}
          >
            <AlertCircle size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '.08em',
                fontWeight: 700,
                color: 'var(--mute)',
                textTransform: 'uppercase',
                marginBottom: '7px',
              }}
            >
              Work Email
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                height: '48px',
                borderRadius: '14px',
                padding: '0 16px',
                background: 'var(--soft)',
                border: focusedField === 'email' ? '1px solid var(--p1)' : '1px solid var(--line)',
                boxShadow:
                  focusedField === 'email' ? '0 0 0 3px rgba(30, 111, 120, 0.25)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <Mail
                size={18}
                strokeWidth={1.8}
                style={{
                  color: focusedField === 'email' ? 'var(--p1)' : 'var(--mute)',
                  flexShrink: 0,
                  transition: 'color 0.18s ease',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="admin@school.edu"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '.08em',
                fontWeight: 700,
                color: 'var(--mute)',
                textTransform: 'uppercase',
                marginBottom: '7px',
              }}
            >
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                height: '48px',
                borderRadius: '14px',
                padding: '0 16px',
                background: 'var(--soft)',
                border:
                  focusedField === 'password' ? '1px solid var(--p1)' : '1px solid var(--line)',
                boxShadow:
                  focusedField === 'password' ? '0 0 0 3px rgba(30, 111, 120, 0.25)' : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <Lock
                size={18}
                strokeWidth={1.8}
                style={{
                  color: focusedField === 'password' ? 'var(--p1)' : 'var(--mute)',
                  flexShrink: 0,
                  transition: 'color 0.18s ease',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--mute)',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px',
              marginTop: '2px',
            }}
          >
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: 'var(--mute)',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--p1)',
                  width: '15px',
                  height: '15px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              />
              <span>Remember me</span>
            </label>

            <span style={{ color: 'var(--mute)', fontSize: '12px' }}>Class 6 – 8 Institutional</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '48px',
              width: '100%',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--p1), var(--p2))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14.5px',
              fontFamily: 'Manrope, sans-serif',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(15, 59, 68, 0.35)',
              transition: 'all 0.18s ease',
              marginTop: '4px',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} strokeWidth={2.4} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In as Admin</span>
                <ArrowRight size={17} strokeWidth={2.2} />
              </>
            )}
          </button>
        </form>

        {/* Security & System Trust Footer */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: '1px solid var(--line)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: 'var(--mute)',
            }}
          >
            <ShieldCheck size={14} color="#2B8791" strokeWidth={2} />
            <span>256-bit Encrypted Session · Protected Portal</span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--mute)', opacity: 0.75 }}>
            Sunrise Model School Management System
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
