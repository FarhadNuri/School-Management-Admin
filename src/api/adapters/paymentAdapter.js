import { formatDate, getMonthAbbr, getDayNum } from './helpers';

const PURPOSE_LABELS = {
  tuition: 'Tuition',
  exam_fee: 'Exam fee',
  uniform: 'Uniform',
  transport: 'Transport',
  books: 'Books',
  other: 'Other',
};

export function adaptPayment(raw = {}) {
  const student = raw.student || {};
  const studentUser = student.user || {};
  const guardian = raw.guardian || {};
  const guardianUser = guardian.user || {};

  const sName =
    student.name ||
    (typeof raw.student === 'string' && raw.student ? raw.student : '') ||
    `${studentUser.firstName || student.firstName || ''} ${studentUser.lastName || student.lastName || ''}`.trim() ||
    raw.studentName ||
    'Student';
  const gName =
    guardian.name ||
    (typeof raw.guardian === 'string' && raw.guardian ? raw.guardian : '') ||
    `${guardianUser.firstName || guardian.firstName || ''} ${guardianUser.lastName || guardian.lastName || ''}`.trim() ||
    raw.guardianName ||
    'Guardian';

  const statusKey = String(raw.statusKey || raw.status || 'unpaid').toLowerCase();
  const isPaid = statusKey === 'paid';
  const isOverdue = statusKey === 'overdue' || raw.status === 'Overdue';
  const isCancelled = statusKey === 'cancelled';

  let statusLabel = 'Pending';
  let statusColor = '';
  if (isPaid) {
    statusLabel = 'Paid';
    statusColor = 'g';
  } else if (isOverdue) {
    statusLabel = 'Overdue';
    statusColor = 'r';
  } else if (isCancelled) {
    statusLabel = 'Cancelled';
    statusColor = '';
  } else if (raw.status === 'Partial') {
    statusLabel = 'Partial';
    statusColor = 'b';
  }

  const amount = Number(raw.amount || 0);
  const amountPaid = Number(raw.amountPaid || 0);
  const balance = Number(raw.balance != null ? raw.balance : (amount - amountPaid));

  const displayAmount = isPaid ? amount : balance;
  const balanceType = isPaid ? 'AMOUNT' : 'BALANCE';

  const dateForTile = raw.dueDate || raw.createdAt;

  return {
    id: String(raw._id || raw.id || ''),
    rawPayment: raw,
    student: sName,
    studentId: String(student._id || student.id || ''),
    guardian: gName,
    guardianEmail: guardianUser.email || guardian.email || '',
    title: raw.title || 'Invoice',
    feeType: PURPOSE_LABELS[raw.purpose] || raw.purpose || 'Tuition',
    purpose: raw.purpose || 'tuition',
    amount: `USD ${displayAmount.toLocaleString()}`,
    rawAmount: amount,
    amountPaid,
    balance,
    balanceType,
    status: statusLabel,
    statusKey,
    statusColor,
    isPaid,
    isOverdue,
    isCancelled,
    due: `Due ${raw.dueDateLabel || formatDate(raw.dueDate)}`,
    rawDueDate: raw.dueDate ? String(raw.dueDate).slice(0, 10) : '',
    month: getMonthAbbr(dateForTile),
    day: getDayNum(dateForTile),
    paymentLink: raw.stripeHostedInvoiceUrl || raw.paymentUrl || null,
    notes: raw.notes || raw.description || '—',
    transactionId: raw.transactionId || '—',
    createdAt: formatDate(raw.createdAt),
  };
}

export function adaptPaymentsList(raw = {}) {
  const payments = (raw.payments || []).map(adaptPayment);

  // Compute stat tiles directly from list as required in prompt section 5
  let totalCollected = 0;
  let outstanding = 0;
  let overdueCount = 0;
  let paidCount = 0;

  payments.forEach((p) => {
    totalCollected += p.amountPaid;
    outstanding += p.balance;
    if (p.isOverdue) overdueCount += 1;
    if (p.isPaid) paidCount += 1;
  });

  const stats = [
    { label: 'Total collected', value: `USD ${totalCollected.toLocaleString()}`, tint: '' },
    { label: 'Outstanding', value: `USD ${outstanding.toLocaleString()}`, tint: 'ta' },
    { label: 'Overdue', value: String(overdueCount), tint: 'tr' },
    { label: 'Paid in full', value: String(paidCount), tint: 'tg2' },
  ];

  return {
    count: raw.count ?? payments.length,
    payments,
    stats,
  };
}
