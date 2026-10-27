import api from '../client';
import { buildFormData } from '../formData';
import { adaptClass, adaptClassesList } from '../adapters/classAdapter';

export async function getClasses({ search = '', isActive } = {}) {
  const params = {};
  if (search) params.search = search;
  if (isActive !== undefined && isActive !== 'All' && isActive !== '') {
    params.isActive = String(isActive);
  }
  const raw = await api.get('/classes', { params });
  return adaptClassesList(raw);
}

export async function getClassById(id) {
  const raw = await api.get(`/classes/${id}`);
  return adaptClass(raw.class || raw);
}

export async function addClass(data) {
  const { coverImage, ...fields } = data;
  const files = { coverImage };
  const fd = buildFormData(fields, files);

  const raw = await api.post('/classes', fd);
  return adaptClass(raw.class || raw);
}

export async function updateClass(id, data) {
  const { coverImage, ...fields } = data;
  const files = { coverImage };
  const fd = buildFormData(fields, files);

  const raw = await api.patch(`/classes/${id}`, fd);
  return adaptClass(raw.class || raw);
}

export async function deleteClass(id) {
  const raw = await api.delete(`/classes/${id}`);
  return raw;
}
