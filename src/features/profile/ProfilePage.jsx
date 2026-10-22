import React, { useState, useRef } from 'react';
import { User, Lock, Monitor, Camera } from 'lucide-react';
import { Avatar, Tag, FormField, useToast, FieldError } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';
import { getCurrentUser, changePassword, updatePhoto } from '../../api/endpoints/auth';
import { resolvePhoto } from '../../api/adapters/helpers';

const TABS = [
  { id: 'profile', label: 'Profile', desc: 'Admin account details', icon: User },
  { id: 'security', label: 'Security', desc: 'Password & credentials', icon: Lock },
  { id: 'appearance', label: 'Appearance', desc: 'Theme settings', icon: Monitor },
];

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const [admin, setAdmin] = useState(() => getCurrentUser() || {});

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [securityErrors, setSecurityErrors] = useState({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fileInputRef = useRef(null);

  const photoUrl = resolvePhoto(admin.photo);
  const fullName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || 'Administrator';

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Profile photo must be less than 5MB.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast('Only image files (JPEG, PNG, WebP) are allowed.', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const updatedAdmin = await updatePhoto(file);
      setAdmin(updatedAdmin);
      addToast('Profile photo updated successfully.', 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to update photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!securityForm.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }
    if (!securityForm.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (securityForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters.';
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setSecurityErrors(errors);
      return;
    }

    setSecurityErrors({});
    setIsUpdatingPassword(true);

    try {
      await changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword,
        confirmPassword: securityForm.confirmPassword,
      });
      addToast('Password updated successfully.', 'success');
      setSecurityForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      addToast(err?.message || 'Failed to update password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div>
      <div className="cd" style={{ marginBottom: '16px' }}>
        <div className="row" style={{ gap: '18px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '84px', height: '84px' }}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '22px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Avatar index={0} size={84} radius={22} />
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--p1)',
                color: '#fff',
                border: '2px solid var(--card)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
              title="Change profile photo"
              disabled={isUploadingPhoto}
            >
              <Camera size={14} strokeWidth={2} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
          </div>

          <div>
            <small style={{ color: 'var(--mute)' }}>Good morning, {admin.firstName || 'Administrator'}</small>
            <h2 style={{ fontSize: '28px' }}>{fullName}</h2>
            <p>Administrator</p>
            <div className="row" style={{ marginTop: '6px' }}>
              <Tag>Admin access</Tag>
            </div>
          </div>

          <Tag color="g" style={{ marginLeft: 'auto' }}>
            Active
          </Tag>
        </div>
      </div>

      <div className="sn">
        <div>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isOn = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                className={`t ${isOn ? 'on' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                role="button"
                tabIndex={0}
              >
                <span className="ib">
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <b>{tab.label}</b>
                  <small>{tab.desc}</small>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cd" style={{ padding: '22px' }}>
          {activeTab === 'profile' && (
            <div className="mb" style={{ padding: 0 }}>
              <div className="pt">
                <h2>Profile</h2>
                <p>Account identity and contact information.</p>
              </div>

              <div className="row">
                <FormField
                  label="FIRST NAME"
                  value={admin.firstName || '—'}
                  disabled
                  style={{ flex: 1 }}
                />
                <FormField
                  label="LAST NAME"
                  value={admin.lastName || '—'}
                  disabled
                  style={{ flex: 1 }}
                />
              </div>

              <div className="row">
                <FormField
                  label="WORK EMAIL"
                  value={admin.email || '—'}
                  disabled
                  style={{ flex: 1 }}
                />
                <FormField
                  label="ROLE"
                  value="Administrator"
                  disabled
                  style={{ flex: 1 }}
                />
              </div>

              <div>
                <button
                  type="button"
                  className="pb"
                  style={{ width: 'fit-content', marginTop: '6px' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  <Camera size={15} strokeWidth={1.8} />
                  {isUploadingPhoto ? 'Uploading...' : 'Upload New Photo'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="mb" style={{ padding: 0 }}>
              <div className="pt">
                <h2>Security</h2>
                <p>Update your admin account password.</p>
              </div>

              <div>
                <FormField
                  label="CURRENT PASSWORD"
                  type="password"
                  value={securityForm.currentPassword}
                  onChange={(v) => setSecurityForm((p) => ({ ...p, currentPassword: v }))}
                />
                <FieldError error={securityErrors.currentPassword} />
              </div>

              <div>
                <FormField
                  label="NEW PASSWORD"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={securityForm.newPassword}
                  onChange={(v) => setSecurityForm((p) => ({ ...p, newPassword: v }))}
                />
                <FieldError error={securityErrors.newPassword} />
              </div>

              <div>
                <FormField
                  label="CONFIRM NEW PASSWORD"
                  type="password"
                  placeholder="Repeat new password"
                  value={securityForm.confirmPassword}
                  onChange={(v) => setSecurityForm((p) => ({ ...p, confirmPassword: v }))}
                />
                <FieldError error={securityErrors.confirmPassword} />
              </div>

              <button
                type="submit"
                className="pb"
                style={{ width: 'fit-content', marginTop: '6px' }}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}

          {activeTab === 'appearance' && (
            <div>
              <div className="pt">
                <h2>Appearance</h2>
                <p>Choose a theme.</p>
              </div>

              <div className="opt" style={{ maxWidth: '420px' }}>
                <span
                  className={theme === 'light' ? 'on' : ''}
                  onClick={() => setTheme('light')}
                >
                  Light
                </span>
                <span
                  className={theme === 'dark' ? 'on' : ''}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </span>
                <span
                  className={theme === 'system' ? 'on' : ''}
                  onClick={() => setTheme('system')}
                >
                  System
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
