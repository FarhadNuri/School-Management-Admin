import api from './client';

export const getAdminGradebooks = async (params = {}) => {
  const res = await api.get('/grades', { params });
  return res?.data !== undefined ? res.data : res;
};

export const getAdminGradebookById = async (id) => {
  const res = await api.get(`/grades/${id}`);
  return res?.data !== undefined ? res.data : res;
};

export const updateAdminGradebook = async (id, data) => {
  const res = await api.put(`/grades/${id}`, data);
  return res?.data !== undefined ? res.data : res;
};

export const togglePublishGradebook = async (id, publish) => {
  const res = await api.patch(`/grades/${id}/publish`, { publish });
  return res?.data !== undefined ? res.data : res;
};
