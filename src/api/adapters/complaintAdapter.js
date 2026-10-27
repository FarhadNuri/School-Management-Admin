import { formatDate, resolvePhoto, capitalize } from './helpers';
import { getStatusConfig } from '../../features/complaints/status';

const SEVERITY_COLOR = {
  high: 'a',
  medium: 'b',
  low: 'g',
};

export function adaptComplaint(raw = {}) {
  const reporter = raw.reporter || {};
  const rawStatusVal = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const statusKey = String(rawStatusVal || 'pending').toLowerCase();
  const severityKey = String(raw.severity || 'low').toLowerCase();

  const statusInfo = getStatusConfig(statusKey);
  const severityColor = SEVERITY_COLOR[severityKey] || '';

  const photoEvidence = Array.isArray(raw.photoEvidence)
    ? raw.photoEvidence.map(resolvePhoto).filter(Boolean)
    : raw.photoEvidence
    ? [resolvePhoto(raw.photoEvidence)].filter(Boolean)
    : [];

  const resolvedDateRaw = raw.resolvedAt || raw.dateResolved || raw.resolutionDate;
  const resolvedFormatted = resolvedDateRaw
    ? formatDate(resolvedDateRaw)
    : statusKey === 'resolved'
    ? formatDate(raw.updatedAt || raw.createdAt)
    : 'Pending';

  return {
    id: String(raw._id || raw.id || ''),
    rawComplaint: raw,
    title: raw.title || '—',
    status: statusInfo.label,
    statusKey,
    statusColor: statusInfo.tagClass,
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
    resolvedAt: resolvedDateRaw || null,
    resolved: resolvedFormatted,
    resolutionNote: raw.resolutionNote || raw.resolutionNotes || '',
    statusHistory: Array.isArray(raw.statusHistory) ? raw.statusHistory : [],
    photoEvidence,
    activeNotice: statusInfo.noticeText || null,
    noticeTone: statusInfo.noticeTone || 'amber',
  };
}

export function adaptComplaintsList(raw = {}) {
  const complaints = raw.complaints || [];
  return {
    count: raw.count ?? complaints.length,
    complaints: complaints.map(adaptComplaint),
  };
}
