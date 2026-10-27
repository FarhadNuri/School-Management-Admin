import api from '../client';
import { buildFormData } from '../formData';
import { adaptCourse, adaptCoursesList } from '../adapters/courseAdapter';

export async function getCourses({ search = '', courseStatus, courseType, isActive } = {}) {
  const params = {};
  if (search) params.search = search;
  if (courseStatus) params.courseStatus = courseStatus;
  else if (isActive === 'Active' || isActive === 'Inactive') {
    params.courseStatus = isActive;
  }
  if (courseType && courseType !== 'All types') {
    params.courseType = courseType;
  }

  const raw = await api.get('/courses', { params });
  return adaptCoursesList(raw);
}

export async function getCourseById(id) {
  const raw = await api.get(`/courses/${id}`);
  return adaptCourse(raw.course || raw);
}

export async function addCourse(data) {
  const { coverImage, ...fields } = data;
  const files = { coverImage };
  const fd = buildFormData(fields, files);

  const raw = await api.post('/courses', fd);
  return adaptCourse(raw.course || raw);
}

export async function updateCourse(id, data) {
  const { coverImage, ...fields } = data;
  const files = { coverImage };
  const fd = buildFormData(fields, files);

  const raw = await api.patch(`/courses/${id}`, fd);
  return adaptCourse(raw.course || raw);
}

export async function deleteCourse(id) {
  const raw = await api.delete(`/courses/${id}`);
  return raw;
}

