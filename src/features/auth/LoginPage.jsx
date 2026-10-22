import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/endpoints/auth';
import { Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg)',
        padding: '16px',
      }}
    >
      <div
        className="cd"
        style={{
          width: '420px',
          maxWidth: '100%',
          padding: '32px 28px',
          borderRadius: '24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo" style={{ border: 0, padding: 0, marginBottom: '6px' }}>
            <b style={{ fontSize: '24px' }}>Northfield</b>
            <small style={{ fontSize: '11px' }}>ADMIN</small>
          </div>
          <p style={{ color: 'var(--mute)', fontSize: '13px' }}>
            Sign in to access the Administrator Portal
          </p>
        </div>

        {error && (
          <div
            className="nt"
            style={{
              marginTop: 0,
              background: 'rgba(214,69,90,.12)',
              color: '#C23A52',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label
              style={{
                fontSize: '11px',
                letterSpacing: '.1em',
                fontWeight: 700,
                color: 'var(--mute)',
                textTransform: 'uppercase',
              }}
            >
              Work Email
            </label>
            <div className="in" style={{ marginTop: '6px' }}>
              <Mail size={17} strokeWidth={1.8} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.edu"
                required
              />
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: '11px',
                letterSpacing: '.1em',
                fontWeight: 700,
                color: 'var(--mute)',
                textTransform: 'uppercase',
              }}
            >
              Password
            </label>
            <div className="in" style={{ marginTop: '6px' }}>
              <Lock size={17} strokeWidth={1.8} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="pb"
            style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In as Admin →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--mute)' }}>
          Northfield School Management System
        </div>
      </div>
    </div>
  );
}
