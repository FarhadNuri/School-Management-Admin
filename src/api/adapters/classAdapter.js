import { resolvePhoto } from './helpers';

export function adaptClass(raw = {}) {
  const teachers = raw.teachers || [];
  const courses = raw.courses || [];
  const students = raw.students || [];

  const teacherNames = teachers
    .map((t) => (t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() : 'Teacher'))
    .filter(Boolean)
    .join(', ');

  return {
    id: String(raw._id || raw.id || ''),
    rawClass: raw,
    name: raw.className || '—',
    className: raw.className || '—',
    grade: raw.grade != null ? String(raw.grade) : '—',
    code: raw.classCode || '—',
    classCode: raw.classCode || '—',
    description: raw.description || '—',
    capacity: raw.capacity ?? '—',
    coverImage: resolvePhoto(raw.coverImage),
    academicYear: raw.academicYear ? `${raw.academicYear} academic year` : '—',
    rawAcademicYear: raw.academicYear || '',
    enrolled: String(students.length),
    students,
    coursesCount: String(courses.length),
    courses,
    teacher: teacherNames || 'No teacher assigned',
    teachers,
    status: raw.isActive ? 'Active' : 'Inactive',
    isActive: Boolean(raw.isActive),
  };
}

export function adaptClassesList(raw = {}) {
  const classes = raw.classes || [];
  return {
    count: raw.count ?? classes.length,
    classes: classes.map(adaptClass),
  };
}
