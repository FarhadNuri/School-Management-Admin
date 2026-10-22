import api from '../client';
import { buildFormData } from '../formData';

export async function login({ email, password }) {
  const data = await api.post('/login', { email, password });
  if (data?.token) {
    localStorage.setItem('admin_token', data.token);
  }
  if (data?.admin) {
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
  }
  return data;
}

export async function logout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  return true;
}

export async function getMe() {
  const data = await api.get('/me');
  if (data?.admin) {
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
  }
  return data?.admin;
}

export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  return await api.patch('/me/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
}

export async function updatePhoto(photoFile) {
  const fd = buildFormData({}, { photo: photoFile });
  const data = await api.patch('/me/photo', fd);
  if (data?.admin) {
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
    window.dispatchEvent(new Event('admin_user_updated'));
  }
  return data?.admin;
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  const token = localStorage.getItem('admin_token');
  const user = getCurrentUser();
  return Boolean(token && user && user.role === 'admin' && user.isActive !== false);
}
