export function resolvePhoto(photo) {
  if (!photo) return null;
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object' && photo.url) return photo.url;
  return null;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function getMonthAbbr(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  } catch {
    return '—';
  }
}

export function getDayNum(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return String(d.getDate());
  } catch {
    return '—';
  }
}

export function calculateAge(dobString) {
  if (!dobString) return '—';
  try {
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '—';
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    const age = Math.abs(ageDt.getUTCFullYear() - 1970);
    return `${age} yrs`;
  } catch {
    return '—';
  }
}

export function capitalize(str) {
  if (!str) return '';
  const s = String(str);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatBdPhone(input) {
  if (!input) return '+88';
  let str = String(input).trim();
  if (str === '+' || str === '+8' || str === '8' || str === '+88' || str === '') {
    return '+88';
  }
  if (str.startsWith('+88')) {
    str = str.slice(3);
  } else if (str.startsWith('88')) {
    str = str.slice(2);
  }
  const digits = str.replace(/\D/g, '').slice(0, 11);
  return `+88${digits}`;
}
