import api from './client';

export const getAdminGradebooks = async (params = {}) => {
  const res = await api.get('/grading/admin/grades', { params });
  return res?.data !== undefined ? res.data : res;
};

export const getAdminGradebookById = async (id) => {
  const res = await api.get(`/grading/admin/grades/${id}`);
  return res?.data !== undefined ? res.data : res;
};

export const updateAdminGradebook = async (id, data) => {
  const res = await api.put(`/grading/admin/grades/${id}`, data);
  return res?.data !== undefined ? res.data : res;
};

export const togglePublishGradebook = async (id, publish) => {
  const res = await api.patch(`/grading/admin/grades/${id}/publish`, { publish });
  return res?.data !== undefined ? res.data : res;
};
