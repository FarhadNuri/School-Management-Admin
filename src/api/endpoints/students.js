import api from '../client';
import { buildFormData } from '../formData';
import { adaptStudent, adaptStudentsList } from '../adapters/studentAdapter';

export async function getStudents({ search = '', isActive } = {}) {
  const params = {};
  if (search) params.search = search;
  if (isActive !== undefined && isActive !== 'All' && isActive !== '') {
    params.isActive = String(isActive);
  }
  const raw = await api.get('/students', { params });
  return adaptStudentsList(raw);
}

export async function getStudentById(id) {
  const raw = await api.get(`/students/${id}`);
  return adaptStudent(raw.student || raw);
}

export async function setStudentStatus(id, isActive) {
  const raw = await api.patch(`/students/${id}/status`, { isActive });
  return adaptStudent(raw.student || raw);
}

export async function addStudent(data) {
  const {
    photo,
    idFront,
    idBack,
    guardianPhoto,
    guardianIdFront,
    guardianIdBack,
    ...fields
  } = data;

  const files = {
    photo,
    idFront,
    idBack,
    guardianPhoto,
    guardianIdFront,
    guardianIdBack,
  };

  const fd = buildFormData(fields, files);
  const res = await api.post('/students', fd);
  return adaptStudent(res.student || res);
}

export async function updateStudent(id, data) {
  const {
    photo,
    idFront,
    idBack,
    guardianPhoto,
    guardianIdFront,
    guardianIdBack,
    ...fields
  } = data;

  const files = {
    photo,
    idFront,
    idBack,
    guardianPhoto,
    guardianIdFront,
    guardianIdBack,
  };

  const fd = buildFormData(fields, files);
  const res = await api.patch(`/students/${id}`, fd);
  return adaptStudent(res.student || res);
}

// Backwards-compatible alias for existing mock service caller
export const enrollStudent = addStudent;
