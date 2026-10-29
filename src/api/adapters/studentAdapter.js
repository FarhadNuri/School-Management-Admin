import { resolvePhoto, formatDate, calculateAge } from './helpers';

export function adaptStudent(raw = {}) {
  const user = raw.user || {};
  const guardianUser = raw.guardian?.user || {};
  const classItem = raw.class || {};

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || '—';

  const gFirst = guardianUser.firstName || '';
  const gLast = guardianUser.lastName || '';
  const gFullName = `${gFirst} ${gLast}`.trim() || '—';

  const classTeacher = classItem.teachers?.[0]?.user
    ? `${classItem.teachers[0].user.firstName || ''} ${classItem.teachers[0].user.lastName || ''}`.trim()
    : '—';

  const city = user.address?.city
    ? `${user.address.city}${user.address.country ? ', ' + user.address.country : ''}`
    : '—';

  return {
    id: String(raw._id || raw.id || ''),
    rawStudent: raw,
    name: fullName,
    firstName,
    lastName,
    photo: resolvePhoto(user.photo) || '/Student.jpg',
    guardian: gFullName,
    guardianName: gFullName,
    guardianFirstName: gFirst,
    guardianLastName: gLast,
    guardianEmail: guardianUser.email || '—',
    guardianPhone: guardianUser.contactInfo?.phone || '—',
    guardianRel: 'Guardian',
    guardianIdType: raw.guardian?.idType || '—',
    guardianAddress: guardianUser.address || {},
    guardianPhoto: resolvePhoto(guardianUser.photo) || '/Guardians.jpg',
    guardianIdFront: resolvePhoto(raw.guardian?.identification?.front),
    guardianIdBack: resolvePhoto(raw.guardian?.identification?.back),
    class: classItem.className || '—',
    classId: classItem._id ? String(classItem._id) : '',
    classTeacher,
    email: user.email || '—',
    city,
    status: user.isActive ? 'Active' : 'Inactive',
    isActive: Boolean(user.isActive),
    admittedDate: formatDate(raw.createdAt),
    age: calculateAge(user.dateOfBirth),
    dob: formatDate(user.dateOfBirth),
    rawDob: user.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : '',
    idType: raw.idType || '—',
    emergencyContact: raw.emergencyContact || '—',
    gender: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '—',
    rawGender: user.gender || 'female',
    street: user.address?.street || '—',
    state: user.address?.state || '—',
    zip: user.address?.zip || '—',
    country: user.address?.country || '—',
    phone: user.contactInfo?.phone || '—',
    altPhone: user.contactInfo?.altPhone || '—',
    whatsapp: user.contactInfo?.whatsapp || '—',
    idFront: resolvePhoto(raw.identification?.front),
    idBack: resolvePhoto(raw.identification?.back),
  };
}

export function adaptStudentsList(raw = {}) {
  const students = raw.students || [];
  return {
    count: raw.count ?? students.length,
    students: students.map(adaptStudent),
  };
}
