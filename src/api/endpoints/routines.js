import api from '../client';

export async function getRoutines(params = {}) {
  const raw = await api.get('/routines', { params });
  return raw.routines || raw;
}

export async function getRoutineById(id) {
  const raw = await api.get(`/routines/${id}`);
  return raw.routine || raw;
}

export async function updateRoutine(id, data) {
  const raw = await api.put(`/routines/${id}`, data);
  return raw.routine || raw;
}

export async function createRoutine(data) {
  const raw = await api.post('/routines', data);
  return raw.routine || raw;
}
