import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { getCurrentUser } from '../api/endpoints/auth';
import { resolvePhoto } from '../api/adapters/helpers';

export function TopBar({ title = 'Dashboard', subtitle = '', isDetail = false, onToggleSidebar }) {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [admin, setAdmin] = React.useState(() => getCurrentUser() || {});

  React.useEffect(() => {
    const handleUpdate = () => setAdmin(getCurrentUser() || {});
    window.addEventListener('admin_user_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('admin_user_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const fullName =
    admin.firstName || admin.lastName
      ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim()
      : 'Administrator';

  const photoUrl = resolvePhoto(admin.photo);
  const roleTitle = (admin.role || 'administrator').toUpperCase();

  return (
    <div className="tb">
      <button
        type="button"
        className="sq"
        id="tg"
        aria-label="Menu"
        onClick={onToggleSidebar}
      >
        <Menu size={17} strokeWidth={1.8} className="i" />
      </button>

      <div>
        <h1 id="tt">
          {title}
          {isDetail && (
            <span style={{ color: 'var(--mute)', fontWeight: 400, fontSize: '12px' }}>
              &nbsp;› Details
            </span>
          )}
        </h1>
        {subtitle && <small id="ts">{subtitle}</small>}
      </div>

      <div
        className="us"
        style={{ cursor: 'pointer' }}
        onClick={() => navigate('/profile')}
      >
        <button
          type="button"
          className="sq"
          id="th"
          aria-label="Theme"
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
        >
          <Moon size={17} strokeWidth={1.8} className="i" />
        </button>

        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            className="av"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span className="av" />
        )}

        <div>
          <b>{fullName}</b>
          <small style={{ color: 'var(--mute)' }}>{roleTitle}</small>
        </div>
      </div>
    </div>
  );
}
