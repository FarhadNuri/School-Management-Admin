import api from '../client';
import { adaptAnnouncement, adaptAnnouncementsList } from '../adapters/announcementAdapter';

export async function getAnnouncements({ search = '', category, severity, targetAudience } = {}) {
  const params = {};
  if (search) params.search = search;
  if (category && category !== 'All' && category !== 'All categories') {
    params.category = category.toLowerCase();
  }
  if (severity && severity !== 'All') {
    params.severity = severity.toLowerCase();
  }
  if (targetAudience && targetAudience !== 'All') {
    params.targetAudience = targetAudience.toLowerCase();
  }

  const raw = await api.get('/announcements', { params });
  return adaptAnnouncementsList(raw);
}

export async function getAnnouncementById(id) {
  const raw = await api.get(`/announcements/${id}`);
  return adaptAnnouncement(raw.announcement || raw);
}

export async function addAnnouncement(data) {
  const payload = {
    title: data.title,
    description: data.description || data.details || '',
    category: data.category ? String(data.category).toLowerCase() : 'general',
    severity: data.severity ? String(data.severity).toLowerCase() : 'medium',
    targetAudience: data.targetAudience || ['all'],
  };

  const raw = await api.post('/announcements', payload);
  return adaptAnnouncement(raw.announcement || raw);
}

export async function updateAnnouncement(id, data) {
  const payload = { ...data };
  if (payload.category) payload.category = String(payload.category).toLowerCase();
  if (payload.severity) payload.severity = String(payload.severity).toLowerCase();

  const raw = await api.patch(`/announcements/${id}`, payload);
  return adaptAnnouncement(raw.announcement || raw);
}
