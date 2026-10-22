import api from '../client';
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
  const raw = await api.post('/courses', data);
  return adaptCourse(raw.course || raw);
}

export async function updateCourse(id, data) {
  const raw = await api.patch(`/courses/${id}`, data);
  return adaptCourse(raw.course || raw);
}
