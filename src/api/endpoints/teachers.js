import api from '../client';
import { buildFormData } from '../formData';
import { adaptTeacher, adaptTeachersList } from '../adapters/teacherAdapter';

export async function getTeachers({ search = '', isActive } = {}) {
  const params = {};
  if (search) params.search = search;
  if (isActive !== undefined && isActive !== 'All' && isActive !== '') {
    params.isActive = String(isActive);
  }
  const raw = await api.get('/teachers', { params });
  return adaptTeachersList(raw);
}

export async function getTeacherById(id) {
  const raw = await api.get(`/teachers/${id}`);
  return adaptTeacher(raw.teacher || raw);
}

export async function setTeacherStatus(id, isActive) {
  const raw = await api.patch(`/teachers/${id}/status`, { isActive });
  return adaptTeacher(raw.teacher || raw);
}

export async function addTeacher(data) {
  const {
    picture,
    qualification0,
    qualification1,
    qualification2,
    idFront,
    idBack,
    status,
    ...fields
  } = data;

  const files = {
    picture,
    qualification0,
    qualification1,
    qualification2,
    idFront,
    idBack,
  };

  const fd = buildFormData(fields, files);
  const res = await api.post('/teachers', fd);
  const teacher = adaptTeacher(res.teacher || res);

  // If Inactive was chosen, call status update since create payload does not store isActive
  if (status === 'Inactive' && teacher.id) {
    try {
      await setTeacherStatus(teacher.id, false);
      teacher.status = 'Inactive';
      teacher.isActive = false;
    } catch (e) {
      console.warn('Failed to set initial inactive status on teacher:', e);
    }
  }

  return teacher;
}

export async function updateTeacher(id, data) {
  const {
    picture,
    qualification0,
    qualification1,
    qualification2,
    idFront,
    idBack,
    ...fields
  } = data;

  const files = {
    picture,
    qualification0,
    qualification1,
    qualification2,
    idFront,
    idBack,
  };

  const fd = buildFormData(fields, files);
  const res = await api.patch(`/teachers/${id}`, fd);
  return adaptTeacher(res.teacher || res);
}

// Backwards-compatible alias for old mock
export const enrollTeacher = addTeacher;

export async function deleteTeacher(id) {
  return api.delete(`/teachers/${id}`);
}
