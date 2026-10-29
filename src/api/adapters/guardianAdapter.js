import { resolvePhoto } from './helpers';

export function adaptGuardian(raw = {}) {
  const user = raw.user || {};
  const students = raw.students || [];

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || '—';

  const city = user.address?.city
    ? `${user.address.city}${user.address.country ? ', ' + user.address.country : ''}`
    : '—';

  const studentLabels = students.map((s) => {
    const sName = s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() : 'Student';
    const sClass = s.class?.className ? ` (${s.class.className})` : '';
    return `${sName}${sClass}`;
  });

  return {
    id: String(raw._id || raw.id || ''),
    rawGuardian: raw,
    name: fullName,
    firstName,
    lastName,
    photo: resolvePhoto(user.photo) || '/Guardians.jpg',
    email: user.email || '—',
    phone: user.contactInfo?.phone || '—',
    altPhone: user.contactInfo?.altPhone || '—',
    whatsapp: user.contactInfo?.whatsapp || '—',
    relationship: 'Guardian',
    studentsCount: `${students.length} student${students.length === 1 ? '' : 's'}`,
    students: studentLabels,
    city,
    street: user.address?.street || '—',
    state: user.address?.state || '—',
    zip: user.address?.zip || '—',
    country: user.address?.country || '—',
    address: user.address || {},
    contactInfo: user.contactInfo || {},
    idType: raw.idType || '—',
    idFront: resolvePhoto(raw.identification?.front),
    idBack: resolvePhoto(raw.identification?.back),
    status: user.isActive ? 'Active' : 'Inactive',
    isActive: Boolean(user.isActive),
  };
}

export function adaptGuardiansList(raw = {}) {
  const guardians = raw.guardians || [];
  return {
    count: raw.count ?? guardians.length,
    guardians: guardians.map(adaptGuardian),
  };
}
