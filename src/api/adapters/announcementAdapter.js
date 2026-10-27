import { formatDate, getMonthAbbr, getDayNum, capitalize } from './helpers';

export function adaptAnnouncement(raw = {}) {
  const categories = Array.isArray(raw.category) ? raw.category : [raw.category];
  const severities = Array.isArray(raw.severity) ? raw.severity : [raw.severity];
  const audiences = Array.isArray(raw.targetAudience) ? raw.targetAudience : [raw.targetAudience];

  const primaryCat = categories[0] || 'general';
  const primarySev = severities[0] || 'medium';

  return {
    id: String(raw._id || raw.id || ''),
    rawAnnouncement: raw,
    title: raw.title || '—',
    details: raw.description || '—',
    description: raw.description || '',
    category: capitalize(primaryCat),
    rawCategory: primaryCat.toLowerCase(),
    severity: capitalize(primarySev),
    rawSeverity: primarySev.toLowerCase(),
    audience: audiences.map(capitalize).join(', ') || 'All',
    targetAudience: audiences.map((a) => String(a).toLowerCase()),
    dateMonth: getMonthAbbr(raw.createdAt),
    dateDay: getDayNum(raw.createdAt),
    postedDate: `Posted ${formatDate(raw.createdAt)}`,
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
  };
}

export function adaptAnnouncementsList(raw = {}) {
  const announcements = raw.announcements || [];
  return {
    count: raw.count ?? announcements.length,
    announcements: announcements.map(adaptAnnouncement),
  };
}
