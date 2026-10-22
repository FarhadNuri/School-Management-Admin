import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getMe, logout, isAuthenticated } from '../api/endpoints/auth';

export function AdminGuard() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());

  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        if (isMounted) {
          setAuthenticated(false);
          setChecking(false);
        }
        return;
      }

      try {
        const admin = await getMe();
        if (isMounted) {
          if (admin && admin.role === 'admin' && admin.isActive !== false) {
            setAuthenticated(true);
          } else {
            await logout();
            setAuthenticated(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          await logout();
          setAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg)',
        }}
      >
        <div style={{ color: 'var(--mute)', fontSize: '13px', fontWeight: 600 }}>
          Verifying session...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
