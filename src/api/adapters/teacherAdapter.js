import { resolvePhoto } from './helpers';

export function adaptTeacher(raw = {}) {
  const user = raw.user || {};
  const classes = raw.classes || [];
  const rawQualifications = Array.isArray(raw.qualifications) ? raw.qualifications : [];

  // Extract qualification titles from array of { title, document } or raw.qualificationTitles
  let qualificationTitles = Array.isArray(raw.qualificationTitles) && raw.qualificationTitles.length > 0
    ? raw.qualificationTitles
    : rawQualifications
        .map((q) => {
          if (!q) return '';
          if (typeof q === 'string') return q;
          return q.title || '';
        })
        .filter(Boolean);

  if (qualificationTitles.length === 0 && raw.qualification && typeof raw.qualification === 'string' && raw.qualification !== '—') {
    qualificationTitles = [raw.qualification];
  }

  const qualification = qualificationTitles[0] || '—';

  // Extract certificate document URLs
  const certificateUrls = rawQualifications
    .map((q) => {
      if (!q) return null;
      if (typeof q === 'string') return resolvePhoto(q);
      if (typeof q === 'object') {
        return resolvePhoto(q.document || q.url || q.file || q);
      }
      return null;
    })
    .filter(Boolean);

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || '—';

  const classesCount = `${classes.length} class${classes.length === 1 ? '' : 'es'}`;
  const assignedClasses = classes.map((c) => c.className || c.classCode || String(c));
  const assignedClassIds = classes.map((c) => String(c._id || c));

  const city = user.address?.city
    ? `${user.address.city}${user.address.country ? ', ' + user.address.country : ''}`
    : '—';

  const idType =
    raw.identification?.type ||
    raw.idType ||
    raw.identificationType ||
    '—';

  const rawCourses = Array.isArray(raw.courses) ? raw.courses : [];
  const assignedSubjects = rawCourses
    .map((c) => {
      if (!c) return '';
      if (typeof c === 'string') return c;
      const title = c.name || c.courseName || '';
      const code = c.code || c.courseCode || '';
      return title ? (code ? `${title} (${code})` : title) : code;
    })
    .filter(Boolean);

  const assignedSubjectNames = rawCourses
    .map((c) => {
      if (!c) return '';
      if (typeof c === 'string') return c;
      return c.name || c.courseName || '';
    })
    .filter(Boolean);

  const assignedSubjectCodes = rawCourses
    .map((c) => {
      if (!c) return '';
      if (typeof c === 'string') return c;
      return c.code || c.courseCode || c.shortCode || c.name || '';
    })
    .filter(Boolean);

  const courses = rawCourses.map((c) => ({
    id: String(c.id || c._id || ''),
    name: c.name || c.courseName || 'Subject',
    code: c.code || c.courseCode || '',
    className: c.className || c.courseClass?.className || '',
    grade: c.grade || c.courseClass?.grade || '',
  }));

  return {
    id: String(raw._id || raw.id || ''),
    rawTeacher: raw,
    name: fullName,
    firstName,
    lastName,
    photo: resolvePhoto(user.photo),
    qualification,
    qualificationTitles,
    qualifications: certificateUrls,
    degree: qualification,
    classesCount,
    assignedClasses,
    assignedClassIds,
    hasCourses: rawCourses.length > 0,
    hasSubjects: rawCourses.length > 0,
    subjectsCount: rawCourses.length,
    assignedSubjects,
    assignedSubjectNames,
    assignedSubjectCodes,
    subjectCodes: assignedSubjectCodes,
    courses,
    status: user.isActive ? 'Active' : 'Inactive',
    isActive: Boolean(user.isActive),
    email: user.email || '—',
    phone: user.contactInfo?.phone || '—',
    altPhone: user.contactInfo?.altPhone || '—',
    whatsapp: user.contactInfo?.whatsapp || '—',
    socialMedia: user.socialMedia || raw.socialMedia || {},
    website: user.socialMedia?.website || raw.socialMedia?.website || raw.website || user.website || '',
    city,
    street: user.address?.street || '—',
    state: user.address?.state || '—',
    country: user.address?.country || '—',
    idType,
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

