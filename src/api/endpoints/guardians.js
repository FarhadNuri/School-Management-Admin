import api from '../client';
import { buildFormData } from '../formData';
import { adaptGuardian, adaptGuardiansList } from '../adapters/guardianAdapter';

export async function getGuardians({ search = '', isActive } = {}) {
  const params = {};
  if (search) params.search = search;
  if (isActive !== undefined && isActive !== 'All' && isActive !== '') {
    params.isActive = String(isActive);
  }
  const raw = await api.get('/guardians', { params });
  return adaptGuardiansList(raw);
}

export async function getGuardianById(id) {
  const raw = await api.get(`/guardians/${id}`);
  return adaptGuardian(raw.guardian || raw);
}

export async function setGuardianStatus(id, isActive) {
  const raw = await api.patch(`/guardians/${id}/status`, { isActive });
  return adaptGuardian(raw.guardian || raw);
}

export async function updateGuardian(id, data) {
  const hasFiles = data.photo || data.idFront || data.idBack;
  let payload = data;
  if (hasFiles) {
    const { photo, idFront, idBack, ...fields } = data;
    payload = buildFormData(fields, { photo, idFront, idBack });
  }
  const raw = await api.patch(`/guardians/${id}`, payload);
  return adaptGuardian(raw.guardian || raw);
}

export async function deleteGuardian(id) {
  return api.delete(`/guardians/${id}`);
}
