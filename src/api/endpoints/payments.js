import api from '../client';
import { adaptPayment, adaptPaymentsList } from '../adapters/paymentAdapter';

export async function getPayments({ search = '', status, purpose, feeType } = {}) {
  const params = {};
  if (search) params.search = search;
  if (status && status !== 'All') {
    // Map chips: Paid -> paid, Pending -> unpaid, Overdue -> overdue
    // Partial and Cancelled have no documented status in backend: load all and filter client-side
    if (status === 'Paid') params.status = 'paid';
    else if (status === 'Pending') params.status = 'unpaid';
    else if (status === 'Overdue') params.status = 'overdue';
  }
  if (purpose && purpose !== 'All fee types') {
    params.purpose = purpose.toLowerCase().replace(/\s+/g, '_');
  } else if (feeType && feeType !== 'All fee types') {
    params.feeType = feeType.toLowerCase().replace(/\s+/g, '_');
  }

  const raw = await api.get('/payments', { params });
  return adaptPaymentsList(raw);
}

export async function getPaymentById(id) {
  const raw = await api.get(`/payments/${id}`);
  return adaptPayment(raw.payment || raw);
}

export async function createInvoice(data) {
  const payload = {
    studentId: data.studentId,
    title: data.title,
    purpose: data.purpose || data.feeType || 'tuition',
    amount: Number(data.amount),
    dueDate: data.dueDate,
    description: data.description || data.notes || '',
  };

  const raw = await api.post('/payments', payload);
  return adaptPayment(raw.payment || raw);
}

export async function resendInvoice(id) {
  return await api.post(`/payments/${id}/resend`);
}

export async function cancelInvoice(id) {
  return await api.post(`/payments/${id}/cancel`);
}
