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
