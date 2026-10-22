import { resolvePhoto } from './helpers';

export function adaptTeacher(raw = {}) {
  const user = raw.user || {};
  const classes = raw.classes || [];
  const qualificationTitles = raw.qualificationTitles || [];

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || '—';

  const qualification = qualificationTitles[0] || '—';
  const classesCount = `${classes.length} class${classes.length === 1 ? '' : 'es'}`;
  const assignedClasses = classes.map((c) => c.className || c.classCode || String(c));
  const assignedClassIds = classes.map((c) => String(c._id || c));

  const city = user.address?.city
    ? `${user.address.city}${user.address.country ? ', ' + user.address.country : ''}`
    : '—';

  return {
    id: String(raw._id || raw.id || ''),
    rawTeacher: raw,
    name: fullName,
    firstName,
    lastName,
    photo: resolvePhoto(user.photo),
    qualification,
    qualificationTitles,
    qualifications: (raw.qualifications || []).map(resolvePhoto).filter(Boolean),
    degree: qualification,
    classesCount,
    assignedClasses,
    assignedClassIds,
    hasCourses: Boolean(raw.courses && raw.courses.length > 0),
    status: user.isActive ? 'Active' : 'Inactive',
    isActive: Boolean(user.isActive),
    email: user.email || '—',
    phone: user.contactInfo?.phone || '—',
    altPhone: user.contactInfo?.altPhone || '—',
    whatsapp: user.contactInfo?.whatsapp || '—',
    socialMedia: user.socialMedia || {},
    city,
    street: user.address?.street || '—',
    state: user.address?.state || '—',
    country: user.address?.country || '—',
    idType: raw.identificationType || '—',
    idFront: resolvePhoto(raw.identification?.front),
    idBack: resolvePhoto(raw.identification?.back),
    dateOfBirth: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
    gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—',
    rawGender: user.gender || 'female',
  };
}

export function adaptTeachersList(raw = {}) {
  const teachers = raw.teachers || [];
  return {
    count: raw.count ?? teachers.length,
    teachers: teachers.map(adaptTeacher),
  };
}
