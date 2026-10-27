export const STATUS = {
  pending: {
    label: 'Open',
    tagClass: 'b',
    noticeText: 'This case is still active and awaiting a resolution.',
    noticeTone: 'amber',
  },
  under_review: {
    label: 'Under review',
    tagClass: 'a',
    noticeText: 'This case is under review.',
    noticeTone: 'amber',
  },
  resolved: {
    label: 'Resolved',
    tagClass: 'g',
    noticeText: 'This case has been resolved.',
    noticeTone: 'green',
  },
};

STATUS.in_progress = STATUS.under_review;

export const STATUS_MAP = STATUS;

export function getStatusConfig(rawStatus) {
  const key = String(rawStatus || '').toLowerCase();
  if (STATUS[key]) {
    return { ...STATUS[key], key };
  }
  return {
    label: rawStatus || 'Unknown',
    tagClass: '',
    noticeText: '',
    noticeTone: 'neutral',
    key,
  };
}

export default STATUS;
