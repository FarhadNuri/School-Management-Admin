import { formatDate, resolvePhoto, capitalize } from './helpers';

const STATUS_MAP = {
  pending: { label: 'Open', color: 'b' },
  in_progress: { label: 'Under Review', color: 'a' },
  resolved: { label: 'Resolved', color: 'g' },
};

const SEVERITY_COLOR = {
  high: 'a',
  medium: 'b',
  low: 'g',
};

export function adaptComplaint(raw = {}) {
  const reporter = raw.reporter || {};
  const statusKey = String(raw.status || 'pending').toLowerCase();
  const severityKey = String(raw.severity || 'low').toLowerCase();

  const statusInfo = STATUS_MAP[statusKey] || { label: capitalize(statusKey), color: '' };
  const severityColor = SEVERITY_COLOR[severityKey] || '';

  const photoEvidence = Array.isArray(raw.photoEvidence)
    ? raw.photoEvidence.map(resolvePhoto).filter(Boolean)
    : raw.photoEvidence
    ? [resolvePhoto(raw.photoEvidence)].filter(Boolean)
    : [];

  return {
    id: String(raw._id || raw.id || ''),
    rawComplaint: raw,
    title: raw.title || '—',
    status: statusInfo.label,
    statusKey,
    statusColor: statusInfo.color,
    severity: capitalize(severityKey),
    severityKey,
    severityColor,
    category: capitalize(raw.category || 'other'),
    complainant: reporter.name || 'Unknown Complainant',
    role: String(reporter.role || 'user').toUpperCase(),
    complainantId: reporter.id || '—',
    reportedParty: raw.reportedParty || '—',
    witnesses: raw.witnesses || '—',
    filedDate: formatDate(raw.dateFiled || raw.createdAt),
    description: raw.description || '—',
    created: formatDate(raw.createdAt),
    updated: formatDate(raw.updatedAt || raw.createdAt),
    resolved: statusKey === 'resolved' ? formatDate(raw.updatedAt || raw.createdAt) : 'Pending',
    photoEvidence,
    activeNotice:
      statusKey === 'pending'
        ? 'This case is still active and awaiting a resolution.'
        : statusKey === 'in_progress'
        ? 'This case is currently under administrative review.'
        : null,
  };
}

export function adaptComplaintsList(raw = {}) {
  const complaints = raw.complaints || [];
  return {
    count: raw.count ?? complaints.length,
    complaints: complaints.map(adaptComplaint),
  };
}
