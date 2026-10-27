import api from '../client';
import { adaptComplaint, adaptComplaintsList } from '../adapters/complaintAdapter';

export async function getComplaints() {
  const raw = await api.get('/complaints');
  return adaptComplaintsList(raw);
}

export async function getComplaintById(id) {
  const raw = await api.get(`/complaints/${id}`);
  return adaptComplaint(raw.complaint || raw);
}

export async function updateComplaintStatus(id, { status, resolutionNote } = {}) {
  const payload = { status };
  if (resolutionNote && typeof resolutionNote === 'string' && resolutionNote.trim()) {
    payload.resolutionNote = resolutionNote.trim();
  }
  const raw = await api.patch(`/complaints/${id}/status`, payload);
  return adaptComplaint(raw.complaint || raw);
}

export async function deleteComplaint(id) {
  return api.delete(`/complaints/${id}`);
}
